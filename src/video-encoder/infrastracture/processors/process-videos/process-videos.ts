import { Injectable } from "@nestjs/common";

@Injectable()

export class ProcessVideoHandler {

    start(){
        console.log("Video Processing Start ......")
    }
}