var Todo = Backbone.Model.extend({
	defaults: function () {
		return {
			title: 'Empty todo ...',
		
			done: false
		};
	},

	toggle: function () {
		this.save({done: !this.get('done')});
	}	
});

test('Testing the type of the Todo Model ...', function () {
	ok(typeof Todo === 'function', 'The Todo Model ought to be an function.');
	ok(typeof new Todo === 'object', 'The Todo instance ought to be an object.');

	var todo = new Todo;

	ok(typeof todo.get('title') === 'string', 'The Todo instance property title, ought to be a string.');
});

var TodoList = Backbone.Collection.extend({
	model: Todo,

	localStorage: new Backbone.LocalStorage('backbone-todos'),

	remaining: function () {
		return this.where({done: false});
	},

	done: function () {
		return this.where({done: true});
	}	 
});

test('Testing the TodoList Collection ...', function () {
	ok(typeof TodoList === 'function', 'The todo list ought to be a function.');

	ok(typeof new TodoList === 'object', 'A new todo list collection ought to be an object');

	var todos = new TodoList;

	ok(typeof todos.remaining === 'function', 'Ought to be a function.');

	ok(typeof todos.done === 'function', 'Ought to be a function.');
});

var Todos = new TodoList;

var TodoView = Backbone.View.extend({
	tagName: 'li',

	template: _.template(jQuery('#todos-item-template').html()),

	events: {
		'dblclick label': 'edit',
		'keypress .edit': 'updateOnEnter',
		'blur .edit': 'close',
		'click a.destroy': 'destroy',
		'click .toggle-complete': 'toggleDone'
	},
	
	updateOnEnter: function (e) {
		if (e.keyCode === 13) {
			this.$input.blur();
		}
	},

	initialize: function () {

		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'destroy', this.remove);
	},

	render: function () {
		this.$el.html(this.template(this.model.toJSON()));
		this.$input = this.$('.edit');
		console.log(this.$input);
	}, 

	close: function () {
		if (this.$input.val()) {
			this.model.save({'title': this.$input.val()});
			this.$el.removeClass('editing');
			this.$input.val(' ');
		}
	},
	
	edit: function () {
		this.$el.addClass('editing');
	},
	
	destroy: function () {
		this.model.destroy();
	},
	
	remove: function () {
		this.$el.remove();
	},

	toggleDone: function () {
		this.model.toggle();
	}
});

test('Testing the Todo View ...', function () {
	ok(typeof TodoView === 'function', 'The Todo View ought to be, an object.');
});

var AppView = Backbone.View.extend({
	el: jQuery('#todos'),

	template: _.template(jQuery('#todos-stats-template').html()),

	events: {
		'keypress #new-todo': 'createOnEnter',
		'click #toggle-all': 'toggleAllCompleted',
		'click #clear-completed': 'clearCompleted'
	},

	createOnEnter: function (e) {
		if(e.keyCode === 13) {
			if (this.$input.val()) {
				Todos.create({title: this.$input.val()});

				this.$input.val('');
			} else {
				return;
			}
		}
	},

	initialize: function () {
		this.$main = this.$('#todos-main');
		this.$footer = this.$('#todos-footer');
		this.$input = this.$('#new-todo');
		this.allCheckbox = this.$('#toggle-all')[0];

		this.listenTo(Todos, 'add', this.addOne);
		this.listenTo(Todos, 'refresh', this.addAll);
		this.listenTo(Todos, 'all', this.render);

		Todos.fetch();
	},

	render: function () {

		var remaining = Todos.remaining().length;

		var done = Todos.done().length;

		if (Todos.length) {
		
			this.$main.show();
			this.$footer.show();

			this.$footer.html(this.template({remaining: remaining, done: done}));
		} else {
			this.$main.hide();
			this.$footer.hide();
		} 
	},

	addOne: function (todo) {
		var view = new TodoView({model: todo});
		view.render();

		this.$('#todos-list').append(view.el);
	},

	addAll: function () {
		Todos.each(this.addOne, this);
	},
	
	toggleAllCompleted: function () {

		var that = this;

		Todos.each(function (todo) {
			todo.save({done: that.allCheckbox.checked});

			console.log('Saving ...');

			console.log(todo.get('done'));
		});
	},

	clearCompleted: function () {
		_.invoke(Todos.done(), 'destroy');
		return false;
	}
});

test('Testing the App View ...', function () {
	ok(typeof AppView === 'function', 'The App View Constructor ought to be a function.');
});

var APP = new AppView;		
