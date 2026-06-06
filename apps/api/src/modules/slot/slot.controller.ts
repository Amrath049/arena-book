import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SlotService } from './slot.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateSlotGroupDto,
  UpdateSlotGroupDto,
  CreateSlotDefinitionDto,
  UpdateSlotDefinitionDto,
  BlockSlotDto,
} from './dto/slot.dto';

@Controller('slots')
export class SlotController {
  constructor(private slotService: SlotService) {}

  @UseGuards(JwtAuthGuard)
  @Post('groups')
  createSlotGroup(@Request() req: any, @Body() dto: CreateSlotGroupDto) {
    return this.slotService.createSlotGroup(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('groups/:id')
  updateSlotGroup(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSlotGroupDto,
  ) {
    return this.slotService.updateSlotGroup(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('groups/:id')
  deleteSlotGroup(@Request() req: any, @Param('id') id: string) {
    return this.slotService.deleteSlotGroup(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('groups/:id/definitions')
  addSlotDefinition(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: CreateSlotDefinitionDto,
  ) {
    return this.slotService.addSlotDefinition(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('definitions/:id')
  updateSlotDefinition(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSlotDefinitionDto,
  ) {
    return this.slotService.updateSlotDefinition(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('definitions/:id')
  deleteSlotDefinition(@Request() req: any, @Param('id') id: string) {
    return this.slotService.deleteSlotDefinition(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('court/:courtId')
  getSlotsByCourt(@Param('courtId') courtId: string) {
    return this.slotService.getSlotsByCourt(courtId);
  }

  @Get('available')
  getAvailableSlots(
    @Query('courtId') courtId: string,
    @Query('date') date: string,
  ) {
    return this.slotService.getAvailableSlots(courtId, date);
  }

  @UseGuards(JwtAuthGuard)
  @Post('block')
  blockSlot(@Request() req: any, @Body() dto: BlockSlotDto) {
    return this.slotService.blockSlot(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unblock')
  unblockSlot(@Request() req: any, @Body() dto: BlockSlotDto) {
    return this.slotService.unblockSlot(req.user.id, dto);
  }
}
