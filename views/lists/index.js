'use strict';
var mongojs = require('mongojs');
var _ = require('underscore')
var Promise = require('promise');

exports.find = function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res);

	var include_cards = req.query.include_cards == 'true' ? true : false

	var filters = { name : 1 , index : 1 };

	if(include_cards){
		filters.cards = 1
	}

	workflow.on('findList',function(){

		
		req.app.db.lists.find({ $query :{}, $orderby : {index : 1} },filters).toArray(function(err,lists){
			if(err){
				return workflow.emit('exception',err);
			}
			if(_.isEmpty(lists)){
				return workflow.emit('exception','Lists do not exist')
			}

			if(!include_cards)
				res.send(lists);
			else{

				var promises = []
				_.each(lists,function(list){
					var promise = populateCards(req,res,list)
					promises.push(promise);
					
				})
				Promise.all(promises).then(function(){
					res.send(lists)
				},function(err){
					return workflow.emit('exception',err)
				})
				
			}

		});	

	

		
	})

	workflow.emit('findList');

};

exports.create = function (req,res,next) {

	var workflow = req.app.utilities.workflow(req,res)

	var data = {
	 	name : req.body.name,
	 	created_on : new Date(),
	 	index : 0
	}
	console.log(data)

	workflow.on('getIndex',function(){
		
		req.app.db.lists.findOne({$query:{},$orderby:{index : -1}},function(err,list){
			if(err)
				workflow.emit('exception',err);
			if(list)
				data.index = list.index + 1
			console.log(data)
			workflow.emit('createList');
		});
	});

	workflow.on('createList',function(){
		req.app.db.lists.insert(data,function(err,list){
			if (err){
				workflow.emit('exception',err)
			}
			delete list.created_on;
			console.log(list)
			res.send(list);
		})
	})

	workflow.emit('getIndex');
		
};

exports.read = function(req,res,next){

	var workflow = req.app.utilities.workflow(req,res)

	var include_cards = req.query.include_cards == 'true' ? true : false

	var filters = { name : 1,index : 1};

	if(include_cards){
		filters.cards = 1
	}


	workflow.on('readList',function(){
		var id = req.params.id;
		req.app.db.lists.findOne({'_id': mongojs.ObjectId(id) },filters,function(err,list){
			if(err){
				return workflow.emit('exception',err)
			}
			if(!list){
				return workflow.emit('exception','List does not exist')
			}
			if(include_cards){
				populateCards(req,res,list).then(function(){
					res.send(list)
				},function(err){
					return workflow.emit('exception',err)
				})
			}else{
				res.send(list);
			}
		})
	})

	

	workflow.emit('readList')

};

exports.update =function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res);
	console.log(req.params.id)

	workflow.on('updateList',function(){
		var id = req.params.id;
		var data = req.body;
		data.modified_on = new Date();

		req.app.db.lists.findAndModify({
			query : {'_id':mongojs.ObjectId(id)},
			update : {$set : data},
			fields: {_id:1,name:1}
		},function(err,docs){
			if (err) {
				return workflow.emit('exception',err);
			};
			if (!docs) {
				return workflow.emit('exception','List does not exist');
			};
			_.extend(docs,req.body)
			res.send(docs);
		})
	});

	workflow.emit('updateList');
};

exports.delete = function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res)

	var id = req.params.id;

	workflow.on('validate',function(){
		req.app.db.lists.findOne({_id:mongojs.ObjectId(id)},function(err,list){
			if(err)
				return workflow.emit('exception',err);
			if(!list)
				return workflow.emit('exception','List with the id does not exist');
			return workflow.emit('deleteList')
		});
	})

	workflow.on('deleteList',function(){
		
			var removeCardsPromise = new Promise(function(resolve,reject){
				req.app.db.cards.remove({listID : mongojs.ObjectId(id)},function(err,cardsRemoved){
					if(err){
						return reject(err);
					}
					return resolve()
				})
			})
			var removeListPromise = new Promise(function(resolve,reject){
				req.app.db.lists.remove( {'_id':mongojs.ObjectId(id)},1,function(err,docs){
					if(err){
						return reject()
					}
					return resolve()
				})
			})
			
			Promise.all([removeListPromise]).then(function(){
				return workflow.emit('response');
			},function(err){
				return workflow.emit('exception',err);
			})
					
		
	});	

	workflow.emit('validate')

};

exports.reorder = function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res);
	var id = req.params.id;
	var position = parseInt(req.body.position);

	workflow.on('validate',function(){
		req.app.db.lists.findOne({$query:{},$orderby:{index : -1}},function(err,list){
			if(err)
				return workflow.emit('exception',err);
			if(!list)
				return workflow.emit('exception','There are no lists');
			if(position<0 || position>list.index)
				return workflow.emit('exception','Please enter a valid position');
			return workflow.emit('reorder');
		})
	})

	workflow.on('reorder',function(){
		req.app.db.lists.findOne({_id:mongojs.ObjectId(id)},{index:1},function(err,list){
			if(err)
				return workflow.emit('exception',err);
			if(!list)
				return workflow.emit('exception','List with the id does not exist');
			if(list.index == position){
				workflow.outcome.message = 'The list already exists at the position';
				return workflow.emit('response');
			}
			else if(list.index < position)
				return workflow.emit('shiftDown',list.index);
			else
				return workflow.emit('shiftUp',list.index);
		});
	});
	
	workflow.on('shiftDown',function(currentIndex){
		req.app.db.lists.update({index:{ $gt : currentIndex, $lte : position}}, {$inc : {index:-1}},{multi:true},function(err,lists){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('setIndex');
		})
	})

	workflow.on('shiftUp',function(currentIndex){
		req.app.db.lists.update({index:{ $gte : position, $lt : currentIndex}}, {$inc : {index:1}},{multi:true},function(err,lists){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('setIndex');
		})
	})
	workflow.on('setIndex',function(){
		req.app.db.lists.update({_id:mongojs.ObjectId(id)},{$set :{ index:position}},function(err,list){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('response');
		})
	})

	workflow.emit('validate');
}

var populateCards = function(req,res,list){
	var promise = new Promise(function(resolve,reject){

		req.app.db.cards.find({
			$query : {listID : list._id},
			$orderby : {index : 1}
		},{name:1,desc:1,index:1,listID:1},function(err,cards){
			if(err){
				reject(err);
			}
			list.cards = cards;
			resolve()
		});
	})

	return promise;
}