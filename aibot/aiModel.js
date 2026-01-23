import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import path from 'path';
// 替换 pickle 加载库，如果你有合适的库来加载 Python 的 pickle 文件
// import pickle from 'pickle';  // 这行可以根据实际需要替换或移除

// 加载向量化器和模型
export const loadVectorizer = async (vectorizerPath) => {
    const vectorizerBuffer = fs.readFileSync(vectorizerPath);
    const vectorizer = pickle.loads(vectorizerBuffer);  // 如果无法找到合适的 JS 库加载 Python 的 pickle 文件，可能需要其他方案
    return vectorizer;
};

export const loadModel = async (modelPath) => {
    return await tf.loadLayersModel(`file://${modelPath}`);
};

// 预测最佳走法
export const predictBestMove = async (board, model, vectorizer, preprocessor) => {
    const legalMoves = Array.from(board.legal_moves());
    let bestMove = null;
    let bestScore = -Infinity;

    for (let move of legalMoves) {
        // 生成假设的新棋盘
        board.push(move);
        const fen = board.fen();
        board.pop();

        // 转换当前棋盘的FEN特征
        const X_fen = vectorizer.transform([fen]);
        const additionalFeatures = tf.tensor2d([[1500, 1500, 'middlegame']], [1, 3]);
        const X_additional = preprocessor.transform(additionalFeatures);
        const X = tf.concat([tf.tensor(X_fen.toarray()), X_additional], 1);

        // 对每个棋步的局面进行评分
        const scoreTensor = model.predict(X);
        const score = scoreTensor.dataSync()[0];

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
};

// 在游戏结束时微调模型
export const fineTuneModel = async (model, X_train, y_train) => {
    // X_train 和 y_train 的形状已经正确，不需要重塑
    await model.fit(X_train, y_train, {
        epochs: 1,
        verbose: 0,
    });
    return model;
};

// 保存模型
export const saveModel = async (model, modelPath) => {
    await model.save(`file://${modelPath}`);
};
