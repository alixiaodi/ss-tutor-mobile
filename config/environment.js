const environment = {
	// 开发环境配置
	development: {
		// 本地部署的后端
		// baseURL: 'http://localhost:8080',
		
		// 直接使用线上后端
		baseURL: 'http://192.168.1.103:6633'
	},
	// 生产环境配置
	production: {
		baseURL: 'http://localhost:9994' // 发布时需要修改为后端实际地址
	}
}

module.exports = {
  environment: environment[process.env.NODE_ENV]
}