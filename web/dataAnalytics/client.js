import * as global from "../global-ui.js";











//


var box = document.getElementById("api_results");


async function makeManhoursGraph(){
    const res = await get_api("/analytics/analytics.php/manhours/");

    var info = res.data.posts

    var data = []

    var label = []

    for(var datapoint in info){
        
        data.push(info[datapoint].hours/3600)
        label.push(global.employeeToName(info[datapoint].employee))
    }
    console.log(data)

    const myChart = new Chart(document.getElementById("chart2"), {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Manhours Per Employee',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                  ]
            }]
        }
    });
}
makeManhoursGraph();



async function getProjectPerYear(){
    const res = await get_api("/analytics/analytics.php/projectsyear");
    console.log(res);
    box.innerHTML+=JSON.stringify(res.data.posts)+"\n\n";
    return res;
}

//getProjectPerYear();


async function makeProjectYearGraph(){
    const res = await get_api("/analytics/analytics.php/projectsyear");
    var date = new Date(unix_timestamp * 1000);

    var info = res.data.posts

    var data = {}

    var label = []

    for(var datapoint in info){
        var date = new Date(info[datapoint].projectCreatedAt * 1000);
        if(date.getFullYear in data){
            data.date.getFullYear+=1
        }
        else{
            data.data.getFullYear
        }
        
    }


}

async function getPostViewed(){
    const res = await get_api("/analytics/analytics.php/postviewed/");
    console.log(res);
    box.innerHTML+=JSON.stringify(res)+"\n\n";
    return res;
}

//getPostViewed();




async function makeNumTasksGraph(){
    var result = await get_api("/analytics/analytics.php/numtasks/");

    var info = result.data.posts

    var data = []

    var label = []

    for(var datapoint in info){
        console.log(info[datapoint])
        data.push(info[datapoint].tasks)
        label.push(global.employeeToName(info[datapoint].employee))
    }
    console.log(data)

    const myChart = new Chart(document.getElementById("myChart"), {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Tasks per employee',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                  ]
            }]
        }
        
    });

}

makeNumTasksGraph();

async function makeManagerProportionGraph(){
    const res = await get_api("/analytics/analytics.php/proportion");
    var info = res.data.posts

    var data = []

    var label = ["Employee","Manager"]

    for(var datapoint in info){
        data.push(info[datapoint].num)
    }


    const myChart = new Chart(document.getElementById("chart3"), {
        type: 'doughnut',
        data: {
            labels: label,
            datasets: [{
                label: 'Manager to Employee Ratio',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                  ]
            }]
        }
    });
}

makeManagerProportionGraph();

async function makePostPerAuthorGraph(){
    const res = await get_api("/analytics/analytics.php/postauthor");
    
    
    var info = res.data.posts

    var data = []

    var label = []

    for(var datapoint in info){
        
        data.push(info[datapoint].numposts)
        label.push(global.employeeToName(info[datapoint]))
    }
    console.log(data)

    const myChart = new Chart(document.getElementById("chart4"), {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Posts per employee',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                  ]
            }]
        }
    });
}

makePostPerAuthorGraph();

async function makeManhourPerTask(){
    const res = await get_api("/analytics/analytics.php/manhourforemp/");
    
    var info = res.data.posts
    
    var data = []

    var label =[]

    for(var datapoint in info){
        
        data.push(info[datapoint].task.expectedManHours)
        label.push("Manhours")
    }

    const myChart = new Chart(document.getElementById("chart5"), {
        type: 'polarArea',
        data: {
            labels:label,
            datasets: [{
                label: 'manhours per task',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                  ]
            }]
        },
        options: {
            legend: {
               display: false
            },
            
       }
    });
}

makeManhourPerTask();

async function makeProportionOfTasksGraph(){
    const res = await get_api("/analytics/analytics.php/tasksstate/");
    
    
    
  
    var info = res.data.posts

    var data = []

    var label = []

    for(var datapoint in info){
        
        data.push(info[datapoint].numtasks)
        
        if (info[datapoint].taskState === 0){
            label.push("TODO")
        }else if(info[datapoint].taskState === 1){
            label.push("INPROGRESS")
        }else{
            label.push("COMPLETED")
        }
        
    
    }

    const myChart = new Chart(document.getElementById("chart6"), {
        type: 'pie',
        data: {
            labels: label,
            datasets: [{
                label: 'manhours per task',
                data: data,
                backgroundColor: ["rgba(245,205,188,0.7)", "rgba(188,219,245,0.7)", "rgba(188,245,188,0.7)"],
            }]
        }
    });
    
}

makeProportionOfTasksGraph();



async function makeOverUnderDueGraph(){
    const res = await get_api("/analytics/analytics.php/overdue/");
  
    var info = res.data.posts
    
    var data = [0,0]

    var label = ["OVERDUE","NOT OVERDUE"]

    var time  = Date.now()

    

    for(var datapoint in info){
        
        if (info[datapoint].taskDueDate<time){
            data[0]+=1
        }else{
            data[1]+=1
        }
        
        
    
    }

    const myChart = new Chart(document.getElementById("chart7"), {
        type: 'pie',
        data: {
            labels: label,
            datasets: [{
                label: 'manhours per task',
                data: data,
                backgroundColor: ["rgba(245,205,188,0.7)", "rgba(188,219,245,0.7)", "rgba(188,245,188,0.7)"],
            }]
        }
    });
    
    
}

makeOverUnderDueGraph()

async function makeTechnicalGraph(){
    const res = await get_api("/analytics/analytics.php/technical");
  
    var info = res.data.posts

    

    
    var data = []

    var label = ["Non-technical","Technical"]

    

    

    for(var datapoint in info){
        
        data.push(info[datapoint].numPosts)
    }

    const myChart = new Chart(document.getElementById("chart8"), {
        type: 'pie',
        data: {
            labels: label,
            datasets: [{
                label: 'manhours per task',
                data: data,
                backgroundColor: ["rgba(245,205,188,0.7)", "rgba(188,219,245,0.7)", "rgba(188,245,188,0.7)"],
            }]
        }
    });
    
}

makeTechnicalGraph()
