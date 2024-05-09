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

    const colors = Array.from({ length: data.length }, () => randomColor());

    const myChart = new Chart(document.getElementById("chart2"), {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Manhours Per Employee',
                data: data,
                backgroundColor: colors
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

    const colors = Array.from({ length: data.length }, () => randomColor());

    const myChart = new Chart(document.getElementById("myChart"), {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Tasks per employee',
                data: data,
                backgroundColor: colors
                     
                  
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

    const colors = Array.from({ length: data.length }, () => randomColor());

    const myChart = new Chart(document.getElementById("chart4"), {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'Posts per employee',
                data: data,
                backgroundColor: colors
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
        
        data.push(info[datapoint].task.expectedManHours/3600)
        label.push("Manhours")
    }

    const colors = Array.from({ length: data.length }, () => randomColor());

    const myChart = new Chart(document.getElementById("chart5"), {
        type: 'polarArea',
        data: {
            labels:label,
            datasets: [{
                label: 'manhours per task',
                data: data,
                backgroundColor: colors
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


function randomColor() {
    var h = Math.floor(Math.random() * 360);
    var s = Math.floor(Math.random() * 50) + 50;
    var l = Math.floor(Math.random() * 40) + 50;
    
    var rgbColor = hslToRgb(h, s, l);
    
    var color = `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.15)`;
    
    return color;
}


function hslToRgb(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = l - c / 2;
    var rgb;
    if (h >= 0 && h < 60) {
        rgb = [c, x, 0];
    } else if (h >= 60 && h < 120) {
        rgb = [x, c, 0];
    } else if (h >= 120 && h < 180) {
        rgb = [0, c, x];
    } else if (h >= 180 && h < 240) {
        rgb = [0, x, c];
    } else if (h >= 240 && h < 300) {
        rgb = [x, 0, c];
    } else {
        rgb = [c, 0, x];
    }
    return [
        Math.round((rgb[0] + m) * 255),
        Math.round((rgb[1] + m) * 255),
        Math.round((rgb[2] + m) * 255)
    ];
}


