import { WalletService } from "./wallet.service";
import { Controller } from "@nestjs/common";


@Controller('wallet')
export class WalletController {
    constructor(private walletService: WalletService) {}
}   