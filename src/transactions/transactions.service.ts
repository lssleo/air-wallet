import { Injectable, OnModuleInit } from '@nestjs/common'
import { ethers } from 'ethers'

@Injectable()
export class TransactionsService implements OnModuleInit {
    private provider: ethers.JsonRpcProvider

    onModuleInit() {
        this.provider = new ethers.JsonRpcProvider(process.env.JSON_RPC_URL)
        this.listenForNewBlocks()
    }
    /////////////////////////////// UNCOMMENT !!! ////////////////////////////////

    async listenForNewBlocks() {
        console.log('listenForNewBlocks() stopped')
        // this.provider.on('block', async (blockNumber) => {
        //     const block = await this.provider.getBlock(blockNumber)
        //     this.handleBlock(block)
        // })
    }

    async handleBlock(block: ethers.Block) {
        for (const tx of block.transactions) {
            // Handle each transaction
            console.log(tx)
            // Update balances in the database as needed
        }
    }
}
