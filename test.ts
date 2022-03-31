import { network } from "hardhat";

export class Test {
    NAME: string;

    constructor() {
        this.NAME = network.name;
    }
}