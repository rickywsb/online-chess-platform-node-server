import winston from 'winston';

// 创建一个日志记录器
const logger = winston.createLogger({
  level: 'info', // 设置日志级别
  format: winston.format.json(), // 设置日志格式为 JSON
  defaultMeta: { service: 'user-service' }, // 设置默认的元数据
  transports: [
    // 写入所有日志到文件
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 如果我们不在生产环境，那么在控制台上也打印出日志
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
