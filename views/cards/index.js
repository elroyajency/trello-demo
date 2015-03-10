'use strict';
var mongojs = require('mongojs');
var _ = require('underscore')

exports.find = function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res);

	workflow.on('findCards',function(){
		req.app.db.cards.find({},{name:1,desc: 1,index:1,listID:1},function(err,docs){
			if(err){
				return workflow.emit('exception',err);
			}
			if(_.isEmpty(docs)){
				return workflow.emit('exception','Cards do not exist')
			}
			res.send(docs);
		});
	})

	workflow.emit('findCards');

};

exports.create = function (req,res,next) {

	var workflow = req.app.utilities.workflow(req,res)

	var data = {
		name : req.body.name,
		desc : req.body.desc,
		listID : mongojs.ObjectId(req.body.listID),
		index: 0,
		created_on : new Date()
	}

	workflow.on('validate',function(){
		req.app.db.lists.findOne({_id: data.listID},function(err,list){
			if(err)
				return workflow.emit('exception',err);
			if(!list)
				return workflow.emit('exception','The list Does not exist')
			return workflow.emit('getIndex');
		})
	})

	workflow.on('getIndex',function(){
		req.app.db.cards.findOne({ $query : {listID : data.listID},$orderby : {index : -1}},
			function(err,card){
				if(err)
					return workflow.emit('exception',err);
				if(card)
					data.index = card.index+1;
				return workflow.emit('createCard');
			})
	})

	workflow.on('createCard',function(){
		req.app.db.cards.insert(data,function(err,card){
			if(err)
				return workflow.emit('exception',err);
			delete card.created_on;
			res.send(card);
		})
	})

	workflow.emit('validate');
		
};

exports.read = function(req,res,next){

	var workflow = req.app.utilities.workflow(req,res)
	var id = req.params.id;

	workflow.on('readCard',function(){
		
		req.app.db.cards.findOne({'_id': mongojs.ObjectId(id) },{name:1,desc:1,index:1,listID:1},function(err,card){
			if(err){
				return workflow.emit('exception',err)
			}
			if(!card){
				return workflow.emit('exception','Card does not exist')
			}
			res.send(card);
		})
	})

	workflow.emit('readCard')

};

exports.update =function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res);
	var id = req.params.id;
	var data = {
		name : req.body.name,
		desc : req.body.desc
	}

	workflow.on('updateCard',function(){

		req.app.db.cards.findAndModify({
			query : {'_id':mongojs.ObjectId(id)},
			update : {$set : data},
			fields: {name:1,desc:1,index:1,listID:1}
		},function(err,card){
			if (err) {
				return workflow.emit('exception',err);
			};
			if (!card) {
				return workflow.emit('exception','Card does not exist');
			};
			card.name = data.name
			card.desc = data.desc
			res.send(card);
		})
	});

	workflow.emit('updateCard');
};

exports.delete = function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res)

	var id = req.params.id

	workflow.on('validate',function(){
		req.app.db.cards.findOne({_id:mongojs.ObjectId(id)},{index:1,listID:1},function(err,card){
			if(err)
				return workflow.emit('exception',err);
			if(!card)
				return workflow.emit('exception','Card does not exist');
			return workflow.emit('shiftDown',card.index,card.listID)
		})
	})

	workflow.on('shiftDown',function(index,listID){

		req.app.db.cards.update(
			{listID : listID, 
			index: {$gt:index}
		},{$inc:{index:-1}},{multi:true},function(err,cards){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('deleteCard');
		})
	})

	workflow.on('deleteCard',function(){
		req.app.db.cards.remove({_id:mongojs.ObjectId(id)},function(err,card){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('response');
		})
	})

	workflow.emit('validate')

};


exports.reorder = function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res);

	var id = req.params.id;
	var position = parseInt(req.body.position);
	var currentIndex = 0
	var listID = ''

	workflow.on('validate',function(){
		req.app.db.cards.findOne({_id:mongojs.ObjectId(id)},{index:1,listID:1},function(err,card){
			if(err)
				return workflow.emit('exception',err);
			if(!card)
				return workflow.emit('exception','Card does not exist')
			currentIndex = card.index;
			listID = card.listID;
			return workflow.emit('validatePosition')

		})
	})

	workflow.on('validatePosition',function(){
		req.app.db.cards.findOne({$query:{listID : listID},$orderby:{index : -1}},function(err,card){
			if(err)
				return workflow.emit('exception',err);
			if(!card)
				return workflow.emit('exception','There are no Cards');
			if(position<0 || position>card.index)
				return workflow.emit('exception','Please enter a valid position');
			return workflow.emit('reorder');
		})
	})

	workflow.on('reorder',function(){
		if(currentIndex == position){
			workflow.outcome.message = 'The Card already exists at the position';
			return workflow.emit('response');
		}
		else if(currentIndex < position)
			return workflow.emit('shiftDown');
		else
			return workflow.emit('shiftUp');
	})

	workflow.on('shiftDown',function(){
		req.app.db.cards.update({
			listID : listID,
			index:{ $gt : currentIndex, $lte : position}
		}, {$inc : {index:-1}},{multi:true},function(err,cards){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('setIndex');
		})
	})

	workflow.on('shiftUp',function(){
		req.app.db.cards.update({
			listID : listID,
			index:{ $gte : position, $lt : currentIndex}
		}, {$inc : {index:1}},{multi:true},function(err,cards){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('setIndex');
		})
	})
	workflow.on('setIndex',function(){
		req.app.db.cards.update({_id:mongojs.ObjectId(id)},{$set :{ index:position}},function(err,cards){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('response');
		})
	})

	workflow.emit('validate')

}

exports.move = function(req,res,next){
	var workflow = req.app.utilities.workflow(req,res);
	var id = req.params.id;
	var data = {
		listID : mongojs.ObjectId(req.body.list),
		index : 0
	}

	workflow.on('validate',function(){
		req.app.db.cards.findOne({_id:mongojs.ObjectId(id)},{index:1,listID:1},function(err,card){
			if(err)
				return workflow.emit('exception',err);
			if(!card)
				return workflow.emit('exception','The card does not exist');

			return workflow.emit('shiftDown',card.index,card.listID)
		})
	})
	workflow.on('shiftDown',function(index,listID){
		req.app.db.cards.update(
			{listID : listID, 
			index: {$gt:index}
		},{$inc:{index:-1}},{multi:true},function(err,cards){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('getIndex');
		})
	})
	workflow.on('getIndex',function(){
		req.app.db.cards.findOne({
			$query : {listID : data.listID},
			$orderby : {index : -1}
		},function(err,card){
			if(err)
				return workflow.emit('exception',err);
			if(card)
				data.index = card.index+1;
			return workflow.emit('moveCard');
		})
	})

	workflow.on('moveCard',function(){
		req.app.db.cards.update({_id:mongojs.ObjectId(id)},{$set:data},function(err,card){
			if(err)
				return workflow.emit('exception',err);
			return workflow.emit('response');
		})
	})



	workflow.emit('validate')
}