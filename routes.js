'use strict';

module.exports = function (app) {
	


	// list routes

	app.get('/lists', require('./views/lists/index').find);
	app.post('/lists', require('./views/lists/index').create);
	app.get('/lists/:id',require('./views/lists/index').read );
	app.put('/lists/:id',require('./views/lists/index').update);
	app.delete('/lists/:id',require('./views/lists/index').delete);

	app.post('/lists/reorder/:id',require('./views/lists/index').reorder);


	// card routes

	app.get('/cards', require('./views/cards/index').find);
	app.post('/cards', require('./views/cards/index').create);
	app.get('/cards/:id',require('./views/cards/index').read );
	app.put('/cards/:id',require('./views/cards/index').update);
	app.delete('/cards/:id',require('./views/cards/index').delete);

	app.post('/cards/reorder/:id',require('./views/cards/index').reorder);
	app.post('/cards/move/:id',require('./views/cards/index').move);


	app.get('/clean_db',function(req,res){
		req.app.db.cards.remove({},function(){
			req.app.db.lists.remove({},function(){
				res.sendStatus(200);
			})
		})
	})





	//route not found
  app.all('*', require('./views/http/index').http404);
}