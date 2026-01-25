import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";

export class AdminLoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: 'password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    })
    @IsString()
    @Length(4, 8)
    password: string;
}
    
export class verifyAdmin {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Length(10)
    phone: string;

    @IsNotEmpty()
    @IsString()
    @Length(4, 6)
    otp: string;
}
