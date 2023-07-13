import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { filter, map, tap } from 'rxjs/operators';


   export class Todo {
    id: number
    title: string
    selected: boolean
    constructor(params: Todo){
        this.id = params.id
        this.title = params.title
        this.selected = params.selected
    }
   }
  /**
   * Change event object that is emitted when the user selects a
   * different page size or navigates to another page.
   */


  export enum ApiStatus {
    INIT = 'init',
    LOADING = 'loading',
    READY = 'ready'
  }
  export enum EntityAction {
    ADD = 'ADD',
    UPDATE = 'UPDATE',
    REMOVE = 'REMOVE'
  }

  export interface TodoState {
    todos: {status: ApiStatus, data: {[key: string]: Todo}, lastModified: {type: EntityAction, id: number}[]},
    ui: {
        activeBackgroundColor: string
        colors: string[]
        enableDeleteButton: boolean
    }
  }

@Injectable()
export class TodoStore extends ComponentStore<TodoState> {
  constructor() {
    // set defaults
    super({
      todos: {status: ApiStatus.INIT, data: {}, lastModified:[]},
      ui: {
        activeBackgroundColor: '#FAFAFA',
        colors: ['#FAFAFA','#FEFEFE','#FFFFFF'],
        enableDeleteButton: true
      }
    });
  }
  // *********** Updaters *********** //
 
  readonly setTodos= this.updater((state, todos: Todo[]) => ({
    ...state,
    todos: {status: ApiStatus.READY, data: Object.fromEntries(todos.map(todo => [todo.id,todo])), lastModified: todos.map(todo => {return {type: EntityAction.ADD, id: todo.id} })}
  }));
  readonly addTodoToState= this.updater((state, todo: Todo) => ({
    ...state,
    todos: {status: ApiStatus.READY, data: {...state.todos.data, ...Object.fromEntries([todo].map(todo => [todo.id,todo]))}, lastModified: [todo].map(todo => {return {type: EntityAction.ADD, id: todo.id} })}
  }));
 
  

  // *********** Selectors *********** //
 
  readonly todosEntity$ = this.select(
    (state) => state.todos
  );
 
  readonly ui$ = this.select(
    (state) => state.ui
  );
 

  readonly todos$ = this.select(this.todosEntity$.pipe(filter(entity => entity.status ==ApiStatus.READY),map(entity => Object.values(entity.data))),(todos) => {
    return todos;
  })

  readonly todoLastModifiedCount$ = this.select(this.todosEntity$.pipe(filter(entity => entity.status ==ApiStatus.READY),map(entity => entity.lastModified.length)),(length => {
    return length
  }))

  readonly backgroundColorOptions$ = this.select(this.ui$, (ui => {
    return ui.colors
  }))

  readonly activeBackgroundColor$ = this.select(this.ui$, (ui => {
    return ui.activeBackgroundColor
  }))

  readonly enableDeleteButton$ = this.select(this.ui$, (ui => {
    return ui.enableDeleteButton
  }))

 
  // ViewModel of Paginator component
  readonly vm$ = this.select(
    this.todos$,
    this.todoLastModifiedCount$,
    this.backgroundColorOptions$,
    this.activeBackgroundColor$,
    this.enableDeleteButton$,
    (todos, todoLastModifiedCount, backgroundColorOptions, activeBackgroundColor, enableDeleteButton) => ({
        todos, todoLastModifiedCount, backgroundColorOptions, activeBackgroundColor, enableDeleteButton
    })
  );
 

  readonly addTodo = this.effect<Todo>((trigger$) => {
    return trigger$.pipe(
      tap((todo: Todo) => {
        this.addTodoToState(todo)
      })
    );
  });
 
  readonly loadTodos = this.effect<void>((trigger$) => {
    return trigger$.pipe(
      tap(() => {
        const todos: Todo[] = []
        for (let i = 1; i <= 10; i++){
            todos.push(new Todo({id: i, title: `Todo ${i}`, selected: false}))
        }
        this.setTodos(todos)
        
      })
    );
  });
}