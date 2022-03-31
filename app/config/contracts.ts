export class Contracts {
    NFT: string;
    NFT721: string;
    NFT1155: string;

    constructor(network :string) {
        this.NFT = process.env.CONTRACT_NFT as string;
        this.NFT721 = process.env.CONTRACT_NFT721 as string;
        this.NFT1155 = process.env.CONTRACT_NFT1155 as string;
        if (network == "rinkeby") {
            this.NFT = process.env.CONTRACT_NFT_RINKEBY as string;
            this.NFT721 = process.env.CONTRACT_NFT721_RINKEBY as string;
            this.NFT1155 = process.env.CONTRACT_NFT1155_RINKEBY as string;
        } else if (network == "ropsten") {
            this.NFT = process.env.CONTRACT_NFT_ROPSTEN as string;
            this.NFT721 = process.env.CONTRACT_NFT721_ROPSTEN as string;
            this.NFT1155 = process.env.CONTRACT_NFT1155_ROPSTEN as string;
        }
    }
}