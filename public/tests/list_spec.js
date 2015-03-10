// var frisby = require('frisby');

// frisby.create('Create a list')
// 	.post('localhost:3000/lists',{ name : 'Beginner List'})
// 	.inspectBody()
// 	.expectStatus(200)
// 	.expectHeaderContains('content-type', 'application/json')
// .toss()

describe('list and Card API',function(){
	var intermidiateId = '',
		proId ='',
		expertId = '',
		intCard1 = '',
		intCard2 = '' ,
		expCard2 = '',
		godId = '',
		godCard1 = '';

	describe('clean db',function(){
		it('db has been cleant',function(done){
			$.get('http://localhost:3000/clean_db').then(function(data,status){
				expect(status).toEqual('success');
				done()
			})
		})
	})

	describe('list create',function(){

		it('craete list :Beginner List',function(done){
			$.post('http://localhost:3000/lists',{name:'Beginner List'}).then(function(data,status){
				expect(data.index).toEqual(0);
				expect(data.name).toEqual('Beginner List')
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})

		it('craete list :Intermidiate List',function(done){
			$.post('http://localhost:3000/lists',{name:'Intermidiate List'}).then(function(data,status){
				expect(data.index).toEqual(1);
				expect(data.name).toEqual('Intermidiate List')		
				intermidiateId = data._id		
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})
		it('craete list :Semi Professional List',function(done){
			$.post('http://localhost:3000/lists',{name:'Semi Professional List'}).then(function(data,status){
				expect(data.index).toEqual(2);
				expect(data.name).toEqual('Semi Professional List')
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})
		it('craete list :Professional List',function(done){
			$.post('http://localhost:3000/lists',{name:'Professional List'}).then(function(data,status){
				expect(data.index).toEqual(3);
				expect(data.name).toEqual('Professional List')	
				proId = data._id;			
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})
		it('craete list :Expert List',function(done){
			$.post('http://localhost:3000/lists',{name:'Expert List'}).then(function(data,status){
				expect(data.index).toEqual(4);
				expect(data.name).toEqual('Expert List')
				expertId = data._id				
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})
		it('craete list :God Level List',function(done){
			$.post('http://localhost:3000/lists',{name:'God Level List'}).then(function(data,status){
				expect(data.index).toEqual(5);
				expect(data.name).toEqual('God Level List')
				godId = data._id				
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})


	})

	describe('update list',function(){
		it('change the name of expert list to world class list ',function(done){
			$.ajax({url : 'http://localhost:3000/lists/'+expertId,
				type : 'PUT',
				data : { name : 'World Class List'}
			}).then(function(data){
				expect(data._id).toEqual(expertId);
				expect(data.name).toEqual('World Class List');
				done()
			})
		})
	})

	

	describe('reorder lists',function(){

		it('change position of intermidiate to 1',function(done){
			$.post('http://localhost:3000/lists/reorder/'+intermidiateId, {position : 3}).then(function(data){
				expect(data.success).toEqual(true);
				done()
			})
		})
		it('the position of intermidiate has changed to 3',function(done){
			$.get('http://localhost:3000/lists/'+intermidiateId).then(function(data){
				expect(data.index).toEqual(3)
				done()
			})
		})
		it('change position of Professional to 0',function(done){
			$.post('http://localhost:3000/lists/reorder/'+proId, {position : 0}).then(function(data){
				expect(data.success).toEqual(true);
				done()
			})
		})
		it('the position of intermidiate has changed to 0',function(done){
			$.get('http://localhost:3000/lists/'+proId).then(function(data){
				expect(data.index).toEqual(0)
				done()
			})
		})

	})

	describe('delete list',function(){
		it('create a list item and delete it ',function(done){
			$.post('http://localhost:3000/lists',{name:'temp List'}).then(function(data){
				expect(data.name).toEqual('temp List')
				$.ajax({
					url : 'http://localhost:3000/lists/'+data._id,
					type : 'DELETE'
				}).then(function(dat){
					expect(dat.success).toEqual(true)
					done()
				});
			})
		})
	})




	describe('card create',function(){

		it('create card :intermidiate card 1',function(done){
			$.post('http://localhost:3000/cards',{
				name:'intermidiate card 1',
				desc : 'this is catd 1 of intermediate list',
				listID : intermidiateId
			}).then(function(data,status){
				expect(data.index).toEqual(0);
				intCard1 = data._id
				expect(data.name).toEqual('intermidiate card 1')
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})

		it('create card :intermidiate card 2',function(done){
			$.post('http://localhost:3000/cards',{
				name:'intermidiate card 2',
				desc : 'now its the 2nd card of intermidiate',
				listID : intermidiateId
			}).then(function(data,status){
				expect(data.index).toEqual(1);
				expect(data.name).toEqual('intermidiate card 2')
				intCard2 = data._id
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})

		it('create card :intermidiate card 3',function(done){
			$.post('http://localhost:3000/cards',{
				name:'intermidiate card 3',
				desc : 'now its the 3rd card of intermidiate',
				listID : intermidiateId
			}).then(function(data,status){
				expect(data.index).toEqual(2);
				expect(data.name).toEqual('intermidiate card 3')
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})

		it('create card :expert card 1',function(done){
			$.post('http://localhost:3000/cards',{
				name:'expert card 1',
				desc : 'now its the no 1 card of experts',
				listID : expertId
			}).then(function(data,status){
				expect(data.index).toEqual(0);
				expect(data.name).toEqual('expert card 1')
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})
		it('create card :expert card 2',function(done){
			$.post('http://localhost:3000/cards',{
				name:'expert card 2',
				desc : 'now its the no 2 card of experts',
				listID : expertId
			}).then(function(data,status){
				expect(data.index).toEqual(1);
				expect(data.name).toEqual('expert card 2')
				expCard2 = data._id
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})
		it('create card :god card 1',function(done){
			$.post('http://localhost:3000/cards',{
				name:'god card 1',
				desc : 'now its the no 1 card of god',
				listID : godId
			}).then(function(data,status){
				expect(data.index).toEqual(0);
				expect(data.name).toEqual('god card 1')
				godCard1 = data._id
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})

		it('create card :god card 2',function(done){
			$.post('http://localhost:3000/cards',{
				name:'god card 2',
				desc : 'now its the no 2 card of god',
				listID : godId
			}).then(function(data,status){
				expect(data.index).toEqual(1);
				expect(data.name).toEqual('god card 2')
				// godCard1 = data._id
				expect(status).toMatch('success')
				done()
			},function(err){
				console.log(err);
			})
		})


	})

	describe('delete card',function(){

		it('delete the god card 1',function(done){
			$.ajax({
				url : 'http://localhost:3000/cards/'+godCard1,
				type : 'DELETE'
			}).then(function(data){
				expect(data.success).toEqual(true)
				done()
			})
		})
	})

	describe('delete list with card ',function(){
		it('when god list is deleted the card in the list also shuold be deleted ',function(done){
			$.ajax({
				url:'http://localhost:3000/lists/'+godId,
				type:'DELETE'
			}).then(function(data){
				expect(data.success).toEqual(true)
				done();
			})
		})
	})


	describe('reorder card',function(){

		it('change position of intermidiate card 1 to 2',function(done){
			$.post('http://localhost:3000/cards/reorder/'+intCard1, {position : 2}).then(function(data){
				expect(data.success).toEqual(true);
				done()
			})
		})
		it('the position of intermidiate card 1 has changed to 2',function(done){
			$.get('http://localhost:3000/cards/'+intCard1).then(function(data){
				expect(data.index).toEqual(2)
				done()
			})
		})
		it('change position of expert card 2 to 0',function(done){
			$.post('http://localhost:3000/cards/reorder/'+expCard2, {position : 0}).then(function(data){
				expect(data.success).toEqual(true);
				done()
			})
		})
		it('the position of expert card 2 has changed to 0',function(done){
			$.get('http://localhost:3000/cards/'+expCard2).then(function(data){
				expect(data.index).toEqual(0)
				done()
			})
		})

	})

	describe('move card',function(){
		it('move intermidiate card 2 to expert list',function(done){
			$.post('http://localhost:3000/cards/move/'+intCard2,{list:expertId}).then(function(data){
				expect(data.success).toEqual(true)
				done()
			})
		})
		it('intermidiate card belongs to expert list',function(done){
			$.get('http://localhost:3000/cards/'+intCard2).then(function(data){
				expect(data.listID).toEqual(expertId)
				done()
			})
		})
	})

	describe('get List with cards data',function(){
		it('list 5 should have 3 cards',function(done){
			$.get('http://localhost:3000/lists?include_cards=true').then(function(data){
				expect(data[4].cards.length).toEqual(3)
				done()
			})
		})
	})
	describe('get list without the card data',function(){
		it('lists card attribute shud be undefined',function(done){
			$.get('http://localhost:3000/lists').then(function(data){
				expect(data[4].cards).not.toBeDefined()
				done()
			})
		})
	})



})