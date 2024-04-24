<?php
require("lib/context.php");
require_once("lib/object_commons/object_route.php");

const MESSAGE_MESSAGE_CHECKS = [
    "DELETE"=>[

    ],
    "GET"=>[

    ],
    "PATCH"=>[

    ],
    "POST"=>[

    ],
    
];


function r_chat_message(RequestContext $ctx, string $args) {
    object_manipulation_generic(MESSAGE_MESSAGE_CHECKS, TABLE_MESSAGES, $ctx, $args);
}

function r_chat_messages(RequestContext $ctx, string $args) {

}

register_route(new Route(
    ["GET"],
    "/messages",
    "r_chat_messages",
    1,
    [
        "URL_PATH_ARGS_LEGAL"
    ] // no flags...
));

register_route(new Route(
    OBJECT_GENERAL_ALLOWED_METHODS,
    "/message",
    "r_chat_message",
    1,
    [
        "REQUIRES_BODY",
        "URL_PATH_ARGS_LEGAL",
        "URL_PATH_ARGS_REQUIRED"
    ]
));

contextual_run();
?>