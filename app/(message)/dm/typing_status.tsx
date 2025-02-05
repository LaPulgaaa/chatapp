import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { Signal } from "@/app/home/signal";
import assert from "minimalistic-assert";
import { CHATAPP } from "../util";

export type Recipient = {
  user_id: string;
} & (
  | {
      message_type: "DM";
      conc_id: string;
      notification_type: "typing";
    }
  | {
      message_type: "CHAT";
      room_id: string;
      notification_type: "typing";
    }
);

export type TypingStatusWorker = {
  get_current_time: () => number;
  notify_server_start: (recipient: Recipient) => void;
  notify_server_stop: (recipient: Recipient) => void;
};

export type TypingData = {
  user_id: string;
} & (
  | {
      type: "DM";
      operation: "start" | "stop";
      conc_id: string;
    }
  | {
      type: "CHAT";
      operation: "start" | "stop";
      room_id: string;
    }
);

function is_same_recipient(
  new_recipient: Recipient | null,
  old_recipient: Recipient | null,
) {
  if (new_recipient === null || old_recipient === null) return false;
  if (
    new_recipient.message_type === "DM" &&
    old_recipient.message_type === "DM"
  ) {
    return new_recipient.conc_id === old_recipient.conc_id;
  }
  if (
    new_recipient.message_type === "CHAT" &&
    old_recipient.message_type === "CHAT"
  ) {
    return new_recipient.room_id === old_recipient.room_id;
  }

  return false;
}

function send_typing_notification(typing_data: TypingData) {
  const data = {
    type: "TYPING",
    payload: typing_data,
  };
  Signal.get_instance().SEND(JSON.stringify(data));
}

function send_chat_typing_notification(
  operation: "start" | "stop",
  room_id: string,
  user_id: string,
) {
  const typing_data = {
    type: "CHAT" as const,
    operation,
    room_id,
    user_id,
  };

  send_typing_notification(typing_data);
}

function send_dm_typing_notification(
  operation: "start" | "stop",
  conc_id: string,
  user_id: string,
) {
  const typing_data = {
    type: "DM" as const,
    operation,
    conc_id,
    user_id,
  };

  send_typing_notification(typing_data);
}

function send_typing_notification_based_on_msg_type(
  operation: "start" | "stop",
  recipient: Recipient,
) {
  if (recipient.message_type === "DM") {
    return send_dm_typing_notification(
      operation,
      recipient.conc_id,
      recipient.user_id,
    );
  } else if (recipient.message_type === "CHAT") {
    return send_chat_typing_notification(
      operation,
      recipient.room_id,
      recipient.user_id,
    );
  }
  throw new Error("Message type not found.");
}

type TypingStatusState = {
  current_recipient: Recipient;
  next_send_start_time: number;
  idle_timer: ReturnType<typeof setTimeout>;
} | null;

let typingState: TypingStatusState = null;

export function ComposeBox({
  recipient,
  sendMessage,
  compose,
  setCompose,
}: {
  recipient: Recipient | null;
  sendMessage: () => void;
  compose: string;
  setCompose: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [disable, setDisable] = useState<boolean>(true);

  const setTypingState = (state: TypingStatusState) => {
    typingState = state;
  };

  useEffect(() => {
    if (compose.trim().length === 0) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [compose]);

  function get_current_time() {
    return Date.now();
  }

  function notify_server_start(recipient: Recipient) {
    send_typing_notification_based_on_msg_type("start", recipient);
  }

  function notify_server_stop(recipient: Recipient) {
    send_typing_notification_based_on_msg_type("stop", recipient);
  }

  function maybe_notify_server_start(
    recipient: Recipient,
    worker: TypingStatusWorker,
    typing_start_wait_period: number,
    typing_stop_wait_period: number,
  ) {
    assert(typingState !== null);
    if (typingState.next_send_start_time < worker.get_current_time()) {
      return;
    }

    setTypingState({
      current_recipient: recipient,
      next_send_start_time:
        worker.get_current_time() + typing_start_wait_period,
      idle_timer: start_or_extend_idle_timer(worker, typing_stop_wait_period),
    });

    notify_server_start(recipient);
  }

  function stop_last_notification(worker: TypingStatusWorker) {
    assert(typingState !== null, "Typing State shouldn't be null here");

    clearTimeout(typingState.idle_timer);
    notify_server_stop(typingState.current_recipient);
    setTypingState(null);
  }

  function start_or_extend_idle_timer(
    worker: TypingStatusWorker,
    typing_stop_wait_period: number,
  ) {
    function on_idle_timer() {
      stop_last_notification(worker);
    }

    return setTimeout(on_idle_timer, typing_stop_wait_period);
  }

  function update(
    worker: TypingStatusWorker,
    new_recipient: Recipient | null,
    typing_start_wait_period: number,
    typing_stop_wait_period: number,
  ) {
    if (typingState !== null) {
      if (is_same_recipient(typingState.current_recipient, new_recipient)) {
        assert(new_recipient !== null);
        maybe_notify_server_start(
          new_recipient,
          worker,
          typing_start_wait_period,
          typing_stop_wait_period,
        );
        return;
      }
    }

    if (new_recipient === null) {
      return;
    }

    setTypingState({
      current_recipient: new_recipient,
      next_send_start_time: 0,
      idle_timer: start_or_extend_idle_timer(worker, typing_stop_wait_period),
    });

    notify_server_start(new_recipient);
  }

  return (
    <div className="absolute bottom-0 w-full mb-3 flex">
      <Input
        className="ml-4"
        value={compose}
        onChange={(e) => {
          setCompose(e.target.value);
          const worker: TypingStatusWorker = {
            notify_server_start,
            notify_server_stop,
            get_current_time,
          };
          update(
            worker,
            recipient,
            CHATAPP.typing_stop_wait_period,
            CHATAPP.typing_stop_wait_period,
          );
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && compose.trim().length > 0) sendMessage();
        }}
        type="text"
        placeholder="Message"
      />
      <Button
        disabled={disable}
        onClick={() => {
          if (compose.trim().length > 0) sendMessage();
        }}
        className="mx-4"
      >
        <SendHorizonal />
      </Button>
    </div>
  );
}
