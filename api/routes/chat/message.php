<?php
require("lib/context.php");
require_once("lib/object_commons/object_route.php");

const MESSAGE_MESSAGE_CHECKS = [
    "DELETE"=>[
        "duo_arg",
        "channel_exists",
        "user_in_channel",
        "message_exists",
        "author_authored_message"
    ],
    "GET"=>[
        "duo_arg",
        "channel_exists",
        "user_in_channel",
        "message_exists",
    ],
    "PATCH"=>[
        "duo_arg",
        "channel_exists",
        "user_in_channel",
        "message_exists",
        "author_authored_message"
    ],
    "POST"=>[
        "duo_arg",
        "channel_exists",
        "user_in_channel",
    ],

];


function r_chat_message(RequestContext $ctx, string $args) {
    object_manipulation_generic(MESSAGE_MESSAGE_CHECKS, TABLE_MESSAGES, $ctx, $args);
}

function r_chat_messages(RequestContext $ctx, string $args) {
    object_check_channel_exists($ctx, $args);
    object_check_user_in_channel($ctx, $args);

    // needs pagination
}

function _new_message(RequestContext $ctx, array $body, array $url_specifiers) {
    $author_id = $ctx->session->hex_associated_user_id;
    $channel_id = $url_specifiers[0];

    $msgID = generate_uuid();
    $createdAt = timestamp();
    $content = $body["content"];


    if (db_generic_new(
        TABLE_MESSAGES ,
        [
            $msgID,
            $channel_id,
            $author_id,
            $createdAt,
            $content
        ],
        "sssis"
    )) {

        $body["msgID"] = $msgID;
        $body["messageCreatedAt"] = $createdAt;
        $body["author"] = $author_id;
        $body["channelID"] = $channel_id;

        respond_ok(parse_database_row($body, TABLE_MESSAGES));
    } else {
        respond_internal_error(ERROR_DB_INSERTION_FAILED);
    }
}


function _delete_message(RequestContext $ctx, array $url_specifiers) {
    db_message_delete($url_specifiers[1]);
    respond_no_content();
}

function _edit_message(RequestContext $ctx, array $body, array $url_specifiers) {

    _use_common_edit(TABLE_MESSAGES, $body, $url_specifiers);
}

function _fetch_message(RequestContext $ctx, array $url_specifiers) {
    respond_ok($ctx->message);
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