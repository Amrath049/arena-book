import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSlotGroupDto, UpdateSlotGroupDto, CreateSlotDefinitionDto, UpdateSlotDefinitionDto, BlockSlotDto } from './dto/slot.dto';
import { DAY_INDEX_TO_TYPE, SLOT_STATUS } from '../../common/constants/booking.constants';

@Injectable()
export class SlotService {
  constructor(private prisma: PrismaService) {}

  async createSlotGroup(ownerId: string, dto: CreateSlotGroupDto) {
    const court = await this.prisma.court.findFirst({
      where: { id: dto.courtId, isActive: true },
      include: { gameType: { include: { arena: true } } },
    });
    if (!court) throw new NotFoundException('Court not found');
    if (court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    const existing = await this.prisma.slotDefinitionGroups.findFirst({
      where: { courtId: dto.courtId, dayType: dto.dayType },
    });
    if (existing) throw new ConflictException(`Slot group for ${dto.dayType} already exists`);

    return this.prisma.slotDefinitionGroups.create({
      data: {
        courtId: dto.courtId,
        dayType: dto.dayType,
        price: dto.price,
        date: dto.date ? new Date(dto.date) : null,
      },
      include: { slotDefs: true },
    });
  }

  async updateSlotGroup(groupId: string, ownerId: string, dto: UpdateSlotGroupDto) {
    const group = await this.prisma.slotDefinitionGroups.findFirst({
      where: { id: groupId },
      include: { court: { include: { gameType: { include: { arena: true } } } } },
    });
    if (!group) throw new NotFoundException('Slot group not found');
    if (group.court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    return this.prisma.slotDefinitionGroups.update({ where: { id: groupId }, data: dto });
  }

  async deleteSlotGroup(groupId: string, ownerId: string) {
    const group = await this.prisma.slotDefinitionGroups.findFirst({
      where: { id: groupId },
      include: { court: { include: { gameType: { include: { arena: true } } } } },
    });
    if (!group) throw new NotFoundException('Slot group not found');
    if (group.court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    await this.prisma.slotDefinitionGroups.delete({ where: { id: groupId } });
    return { message: 'Slot group deleted' };
  }

  async addSlotDefinition(groupId: string, ownerId: string, dto: CreateSlotDefinitionDto) {
    const group = await this.prisma.slotDefinitionGroups.findFirst({
      where: { id: groupId },
      include: { court: { include: { gameType: { include: { arena: true } } } } },
    });
    if (!group) throw new NotFoundException('Slot group not found');
    if (group.court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    return this.prisma.slotDefinition.create({
      data: { slotDefGroupId: groupId, startTime: dto.startTime, endTime: dto.endTime, price: dto.price },
    });
  }

  async updateSlotDefinition(defId: string, ownerId: string, dto: UpdateSlotDefinitionDto) {
    const def = await this.prisma.slotDefinition.findFirst({
      where: { id: defId },
      include: { slotDefGroup: { include: { court: { include: { gameType: { include: { arena: true } } } } } } },
    });
    if (!def) throw new NotFoundException('Slot definition not found');
    if (def.slotDefGroup.court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    return this.prisma.slotDefinition.update({ where: { id: defId }, data: dto });
  }

  async deleteSlotDefinition(defId: string, ownerId: string) {
    const def = await this.prisma.slotDefinition.findFirst({
      where: { id: defId },
      include: { slotDefGroup: { include: { court: { include: { gameType: { include: { arena: true } } } } } } },
    });
    if (!def) throw new NotFoundException('Slot definition not found');
    if (def.slotDefGroup.court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    await this.prisma.slotDefinition.delete({ where: { id: defId } });
    return { message: 'Slot definition deleted' };
  }

  async getSlotsByCourt(courtId: string) {
    return this.prisma.slotDefinitionGroups.findMany({
      where: { courtId },
      include: { slotDefs: { orderBy: { startTime: 'asc' } } },
      orderBy: { dayType: 'asc' },
    });
  }

  async getAvailableSlots(courtId: string, date: string) {
    const parsedDate = new Date(date);
    const dayIndex = parsedDate.getUTCDay();
    const dayType = DAY_INDEX_TO_TYPE[dayIndex];

    const [customGroup, dayGroup] = await Promise.all([
      this.prisma.slotDefinitionGroups.findFirst({
        where: { courtId, dayType: 'CUSTOM', date: parsedDate, isActive: true },
        include: { slotDefs: { orderBy: { startTime: 'asc' } } },
      }),
      this.prisma.slotDefinitionGroups.findFirst({
        where: { courtId, dayType, isActive: true },
        include: { slotDefs: { orderBy: { startTime: 'asc' } } },
      }),
    ]);

    const group = customGroup ?? dayGroup;
    if (!group || group.slotDefs.length === 0) return [];

    const dateStart = new Date(date + 'T00:00:00.000Z');
    const dateEnd = new Date(date + 'T23:59:59.999Z');
    const existingSlots = await this.prisma.slot.findMany({
      where: { courtId, date: { gte: dateStart, lte: dateEnd } },
    });
    const slotMap = new Map(existingSlots.map(s => [s.startTime, s]));

    return group.slotDefs.map(def => {
      const existing = slotMap.get(def.startTime);
      const price = def.price ?? group.price ?? 0;
      return {
        id: existing?.id ?? null,
        startTime: def.startTime,
        endTime: def.endTime,
        price,
        status: existing?.status ?? SLOT_STATUS.AVAILABLE,
        slotDefinitionId: def.id,
      };
    });
  }

  async blockSlot(ownerId: string, dto: BlockSlotDto) {
    const court = await this.prisma.court.findFirst({
      where: { id: dto.courtId },
      include: { gameType: { include: { arena: true } } },
    });
    if (!court) throw new NotFoundException('Court not found');
    if (court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    const slotDate = new Date(dto.date + 'T00:00:00.000Z');
    const existing = await this.prisma.slot.findFirst({
      where: { courtId: dto.courtId, date: slotDate, startTime: dto.startTime },
    });

    if (existing) {
      if (existing.status === SLOT_STATUS.BOOKED) throw new ConflictException('Slot is already booked');
      return this.prisma.slot.update({ where: { id: existing.id }, data: { status: SLOT_STATUS.BLOCKED } });
    }

    return this.prisma.slot.create({
      data: {
        courtId: dto.courtId,
        date: slotDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        price: dto.price,
        status: SLOT_STATUS.BLOCKED,
      },
    });
  }

  async unblockSlot(ownerId: string, dto: BlockSlotDto) {
    const court = await this.prisma.court.findFirst({
      where: { id: dto.courtId },
      include: { gameType: { include: { arena: true } } },
    });
    if (!court) throw new NotFoundException('Court not found');
    if (court.gameType.arena.ownerId !== ownerId) throw new ForbiddenException('Not your arena');

    const slotDate = new Date(dto.date + 'T00:00:00.000Z');
    const slot = await this.prisma.slot.findFirst({
      where: { courtId: dto.courtId, date: slotDate, startTime: dto.startTime },
    });

    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.status !== SLOT_STATUS.BLOCKED) throw new ConflictException('Slot is not blocked');

    return this.prisma.slot.update({ where: { id: slot.id }, data: { status: SLOT_STATUS.AVAILABLE } });
  }
}
