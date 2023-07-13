import { Component, OnInit } from '@angular/core';
import {TodoStore} from './todo.store'
@Component({
  selector: 'stackolo-todo-list',
  template: `<p>todo-list works!</p>
    <div *ngIf="todoStore.vm$ | async as vm">
    {{vm.todos | json}}
    </div>
  `,
  styles: [],
  providers: [TodoStore]
})
export class TodoListComponent implements OnInit {

  constructor(public todoStore: TodoStore){
  }

  ngOnInit(): void {
      this.todoStore.loadTodos()
  }
}
