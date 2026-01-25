import { Controller } from "@nestjs/common";
import { SlotService } from "./slot.service";

@Controller('slots')
export class SlotController {
    constructor(private slotService: SlotService) {}
}