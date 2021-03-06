module.exports = {
	urlAdminIndex : '../Server/Web/public/Admin/Page/MasterPage',
	database:{
	    database: 'vonvon',
	    username: 'postgres',
	    password: 'abc123',
	    dialect: 'postgres',
	    host: 'localhost',
	    port: '5432',
	    logging:false
	},
	api:{
		apiPost:{
			create:'/api/createPost',
			update:'/api/updatePost/:id',
			list:'/api/list'
		}
	},
	index:{
		limitIndex:12,
		priorityHot:1
	},
	keyToken:'handoingu',
	url:"http://128.199.167.124"
}