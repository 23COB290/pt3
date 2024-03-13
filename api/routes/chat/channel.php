<?php
require("lib/context.php");


function r_chat_channels(RequestContext $ctx, string $args) {
    
    if ($ctx->request_method == "GET") {
        // list channels
    } else if ($ctx->request_method == "PUT") {
        // add channel to recent list
    } else if ($ctx->request_method == "DELETE") {
        // remove channel from list
        // if groupchat leave & if last member delete
    }

}

function r_chat_channel(RequestContext $ctx, string $args) {
    if ($ctx->request_method == "GET") {
        // get channel info & members
    } else if ($ctx->request_method == "POST") {
        // create channel:
        // type
        // type dm
            // recipient: employee
        // type group
            // name
            // members: [employee, ...]
    }
}

register_route(new Route(
    ["GET", "PUT",],
    "/list",
    "r_chat_channels",
    1,
    []
));

register_route(new Route(
    ["GET", "POST", "DELETE"],
    "/channel",
    "r_chat_channel",
    1,
    [
        "URL_PATH_ARGS_LEGAL",
        "URL_PATH_ARGS_REQUIRED",
        "REQUIRES_BODY"
    ]
));


contextual_run();
?>
