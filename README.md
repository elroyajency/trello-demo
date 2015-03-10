# trello-demo



####mongo cmd
```use raw```



```npm install```


```npm start``` starts node server


```http://localhost:3000/tests``` run tests

```http://localhost:3000/subscriber``` socket subscription

```http://localhost:3000/lists ``` POST (create) <br>
```http://localhost:3000/lists/:id ``` GET (retrive)<br>
```http://localhost:3000/lists/:id ```PUT (update)<br>
```http://localhost:3000/lists/:id ```DELETE (delete)<br>
```http://localhost:3000/lists ```GET (fetch)<br>
```http://localhost:3000/lists/reorder/:id ```POST (change order)<br>

```http://localhost:3000/cards ```POST (create) <br>
```http://localhost:3000/cards/:id ```GET (retrive)<br>
```http://localhost:3000/cards/:id ```PUT (update)<br>
```http://localhost:3000/cards/:id ```DELETE (delete)<br>
```http://localhost:3000/cards ```GET (fetch)<br>
```http://localhost:3000/cards/reorder/:id ```POST (change order)<br>
```http://localhost:3000/cards/move/:id ``` POST (move between lists)<br>
