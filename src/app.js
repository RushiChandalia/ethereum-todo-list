var account;
App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3();
    await App.loadContract();
    await App.render();
    await App.renderTasks()
  },

  loadWeb3: async () => {
    if (typeof window.ethereum != "undefined") {
      const allAccount = await ethereum.request({
        method: "eth_requestAccounts",
      });
      App.account = allAccount[0];
    } else {
      alert("please install the metamask extension");
    }
  },
  loadContract: async () => {
    const todoList = await $.getJSON("TodoList.json");
    App.contracts.TodoList = TruffleContract(todoList);
    App.contracts.TodoList.setProvider(window.ethereum);
    App.todoList = await App.contracts.TodoList.deployed();
  },
  render: async () => {
    if (App.loading) {
      return;
    }

    App.setLoading(true);

    $("#account").html(
      `${App.account.slice(0, 5)}....${App.account.slice(
        App.account.length - 5
      )} `
    );
    // await App.renderTasks();

    // Update loading state
    App.setLoading(false);
  },
  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount();
    const $taskTemplate = $(".taskTemplate");

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.tasks(i);
      const taskId = task[0].toNumber();
      const taskContent = task[1];
      const taskCompleted = task[2];

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone();
      $newTaskTemplate.find(".content").html(taskContent);
      $newTaskTemplate
        .find("input")
        .prop("name", taskId)
        .prop("checked", taskCompleted)
        .on("click", App.toggleCompleted);

      // Put the task in the correct list
      if (taskCompleted) {
        $("#completedTaskList").append($newTaskTemplate);
      } else {
        $("#taskList").append($newTaskTemplate);
      }

      // Show the task
      $newTaskTemplate.show();
    }
  },
  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $("#loader");
    const content = $("#content");
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  },
  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    await App.todoList.createTask(content,{ from:  ethereum.selectedAddress})
    window.location.reload()
  },
  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId,{ from:  ethereum.selectedAddress})
    window.location.reload()
  },
};
$(() => {
  $(window).load(() => {
    App.load();
  });
});
