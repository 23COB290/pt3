<?php

require("lib/context.php");




function r_get_projects_per_year(){
    $posts = db_projects_per_year();

    respond_ok(array(
        "posts"=>$posts
    ));
}


register_route(new Route(
    ["GET"],
    "/projectsyear",
    "r_get_projects_per_year",
    AUTH_LEVEL_USER,
    []
));

function r_get_post_viewed(RequestContext $ctx,string $args){

    $author = $ctx->session->hex_associated_user_id;

    $posts = db_number_post_viewed($author);

    respond_ok(array(
        "posts"=>$posts
    ));
}


register_route(new Route(
    ["GET"],
    "/postviewed",
    "r_get_post_viewed",
    AUTH_LEVEL_USER,
    ["URL_PATH_ARGS_LEGAL",
    "URL_PATH_ARGS_REQUIRED"]
));

function r_number_of_tasks_emp(RequestContext $ctx, string $args){

    $author = $ctx->session->hex_associated_user_id;
    $posts = db_number_task($author);

    respond_ok(array(
        "posts"=>$posts
    ));
}


register_route(new Route(
    ["GET"],
    "/numtasks",
    "r_number_of_tasks_emp",
    AUTH_LEVEL_USER,
    ["URL_PATH_ARGS_LEGAL",
    "URL_PATH_ARGS_REQUIRED"]
));

function r_total_emp_manhours(RequestContext $ctx, string $args){

    $author = $ctx->session->hex_associated_user_id;

    $posts = db_total_employee_manhours($author);

    respond_ok(array(
        "posts"=>$posts
    ));
}

register_route(new Route(
    ["GET"],
    "/manhours",
    "r_total_emp_manhours",
    AUTH_LEVEL_USER,
    ["URL_PATH_ARGS_LEGAL",
    "URL_PATH_ARGS_REQUIRED"]
));


function r_get_manager_to_user(RequestContext $ctx,string $args){
    $posts = db_managers_to_users();
    respond_ok(array(
        "posts"=>$posts
    ));
}

register_route(new Route(
    ["GET"],
    "/proportion",
    "r_get_manager_to_user",
    AUTH_LEVEL_USER,
    []
));

function r_get_posts_per_author(RequestContext $ctx,string $args){
    $posts = db_posts_per_author();
    respond_ok(array(
        "posts"=>$posts
    ));
}

register_route(new Route(
    ["GET"],
    "/postauthor",
    "r_get_posts_per_author",
    AUTH_LEVEL_USER,
    []
));

function r_get_manhours_for_employee(RequestContext $ctx, string $args){

    $empid = $ctx->session->hex_associated_user_id;

    $posts = db_manhours_per_task($empid);

    respond_ok(array(
        "posts"=>$posts
    ));
}

register_route(new Route(
    ["GET"],
    "/manhourforemp",
    "r_get_manhours_for_employee",
    AUTH_LEVEL_USER,
    ["URL_PATH_ARGS_LEGAL",
    "URL_PATH_ARGS_REQUIRED"]
));

function r_get_task_status(RequestContext $ctx, string $args){
    $empid = $ctx->session->hex_associated_user_id;

    $posts = db_proportion_of_tasks($empid);

    respond_ok(array(
        "posts"=>$posts
    ));
}

register_route(new Route(
    ["GET"],
    "/tasksstate",
    "r_get_task_status",
    AUTH_LEVEL_USER,
    ["URL_PATH_ARGS_LEGAL",
    "URL_PATH_ARGS_REQUIRED"]
));


function r_get_overdue_tasks(RequestContext $ctx, string $args){
    $empid = $ctx->session->hex_associated_user_id;

    $posts = db_overdue_to_not_tasks($empid);

    respond_ok(array(
        "posts"=>$posts
    ));
}

register_route(new Route(
    ["GET"],
    "/overdue",
    "r_get_overdue_tasks",
    AUTH_LEVEL_USER,
    ["URL_PATH_ARGS_LEGAL",
    "URL_PATH_ARGS_REQUIRED"]
));

contextual_run();
?>