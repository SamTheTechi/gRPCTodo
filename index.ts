import * as grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const protoDefination = protoLoader.loadSync("./proto/todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(protoDefination);
const todoPackage = grpcObject.todoPackage as any;

const server = new grpc.Server();

interface TodoItem { id: number, task: string };
interface TodoId { id: number };
interface TodoItems { tasks: TodoItem[] };
interface TodoIdTask { task: string };

const AllTasks: TodoItem[] = [];

function createTodo(call: grpc.ServerUnaryCall<TodoIdTask, TodoItem>, callback: grpc.sendUnaryData<TodoItem>) {
  const todoItem: TodoItem = {
    id: AllTasks.length + 1,
    task: call.request.task,
  };
  console.log("Task Created:", todoItem);
  AllTasks.push(todoItem);
  callback(null, todoItem);
}

function readTodo(call: grpc.ServerUnaryCall<{}, TodoItems>, callback: grpc.sendUnaryData<TodoItems>) {
  callback(null, { tasks: AllTasks });
}

function deleteTodo(call: grpc.ServerUnaryCall<TodoId, TodoItem>, callback: grpc.sendUnaryData<TodoItem | null>) {
  const taskIndex = AllTasks.findIndex(item => item.id === call.request.id);

  if (taskIndex === -1) {
    return callback({ code: grpc.status.NOT_FOUND, message: "Task not found" }, null);
  }

  const deletedTask = AllTasks.splice(taskIndex, 1)[0];
  console.log("Task Deleted:", deletedTask);
  callback(null, deletedTask);
}

server.addService(todoPackage.TodoService.service, {
  createTodo,
  readTodo,
  deleteTodo,
});

server.bindAsync("0.0.0.0:5000", grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error(`Server crashed: ${error.message}`);
  } else {
    console.log(`gRPC server running on port ${port}`);
  }
});
