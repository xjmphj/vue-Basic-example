//设置和获取本地缓存
var listData={
	set(key,value){
		localStorage.setItem(key,JSON.stringify(value));
	},
	get(key){
		return JSON.parse(localStorage.getItem(key))||[];
	}
}
//过滤方法
var filter={
	all(list){
		return list;
	},
	unfinished(list){
		return list.filter(function(item){
			return !item.isChecked
		});
	},
	finished(list){
		return list.filter(function(item){
			return item.isChecked
		});
	}
}

var vm=new Vue({
	el:'#content_box',
	data:{
		curdata:'', //当前输入的数据
		editing:'',//记录编辑对应的数据
		beforeEditing:'',//修改之前的数据
		visibility:'all',// 默认选中的分类
		list:listData.get('list-v')//获取本地存储
	},
	watch:{
		list:{
			handler:function(){
				listData.set('list-v',this.list);
			},
			deep:true
		}
	},
	computed:{
		noSelected(){
			return this.list.filter(function(item){
				return !item.isChecked	
			}).length
		},
		filterList(){
			return filter[this.visibility]? filter[this.visibility](this.list):this.list;
		}
	},
	methods:{
		addList(ev){
			this.list.push({'title':ev.target.value,'isChecked':false});
			this.curdata="";
		},
		deleteList(todo){
			var index=this.list.indexOf(todo);
			this.list.splice(index,1);
		},
		edtorList(todo){
			this.beforeEditing=todo.title;
			this.editing=todo;
		},
		editorEd(){
			this.editing=''; //记录的东西数据清空，可以隐藏editing 样式的显示
		},
		escEditor(todo){
			todo.title=this.beforeEditing;
			//this.beforeEditing='';
			this.editing='';
		}
	},
	directives:{ //自定义指令，需要对纯 DOM 元素进行底层操作，需要调用原生方法的时候，设置自定义指令比较好
		'focus':{
			update(el,binding){
				if(binding.value){ //值为true 时，focus 选中
					el.focus();
				}
			}

		}
	}
});

function watchHashChange(){
	var hash=window.location.hash.slice(1);
	vm.visibility=hash;
}

watchHashChange();
//绑定hashchange 事件
window.addEventListener('hashchange',watchHashChange);