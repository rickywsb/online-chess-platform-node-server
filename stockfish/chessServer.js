import { spawn } from 'child_process';

class ChessServer {
    constructor() {
        this.stockfish = spawn('/opt/homebrew/bin/stockfish');
        this.stockfish.stdin.setEncoding('utf-8');
        this.stockfish.stdout.on('data', data => {
            console.log(`Stockfish output: ${data}`);
        });
        this.stockfish.stderr.on('data', data => {
            console.error(`Stockfish error: ${data}`);
        });
        this.stockfish.on('close', code => {
            console.log(`Stockfish process exited with code ${code}`);
        });
    }

    sendCommand(command) {
        return new Promise((resolve, reject) => {
            let dataBuffer = '';

            console.log(`Sending command to Stockfish: ${command}`);
            this.stockfish.stdin.write(`${command}\n`);

            const onData = data => {
                const dataStr = data.toString();
                console.log(`Stockfish data: ${dataStr}`);
                dataBuffer += dataStr;
                if (dataBuffer.includes('bestmove') || dataBuffer.includes('uciok')) {
                    this.stockfish.stdout.removeListener('data', onData);
                    resolve(dataBuffer);
                }
            };

            this.stockfish.stdout.on('data', onData);
            this.stockfish.stderr.on('data', data => {
                console.error(`Stockfish error data: ${data}`);
            });
        });
    }

    async getBestMove(fen) {
        try {
            console.log("Sending UCI command to test basic communication");
            const uciResult = await this.sendCommand('uci');
            console.log("UCI command response:", uciResult);

            await this.sendCommand(`position fen ${fen}`);
            const result = await this.sendCommand('go movetime 10000');
            console.log("Stockfish response:", result);

            const match = result.match(/bestmove (\w+)/);
            return match ? match[1] : null;
        } catch (error) {
            console.error('Error in getBestMove:', error);
            return null;
        }
    }
}

export default new ChessServer();
