import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";


export class PlayerLoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
        message: 'password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character',
    })
    password: string;
}   

export class playerVerify {

    @IsString()
    @IsNotEmpty()
    name:string

    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    @Length(10)
    phone:string

    @IsString()
    @IsNotEmpty()
    @Length(4, 8)
    otp:string
}