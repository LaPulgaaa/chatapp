import express from "express";

import { prisma } from "../../packages/prisma/prisma_client";
import authenticate from "../middleware/authenticate";
import { RedisSubscriptionManager } from "../socket/redisClient";

const router = express.Router();

router.post("/joinChat", authenticate, async (req, res) => {
  const { roomId, memberId } = req.body;
  try {
    const room = await prisma.chat.findUnique({
      where: {
        id: roomId,
      },
    });
    if (room !== null) {
      const room_opcode = await prisma.message.create({
        data: {
          content: `chat_${memberId}`,
          memberId,
          chatId: room.id,
          deleted: true,
        },
      });
      const directory = await prisma.directory.create({
        data: {
          userId: memberId,
          chat_id: roomId,
          after: new Date(),
        },
      });

      res.status(201).json({
        msg: "Joined new room",
        raw_data: room,
        raw_opcode: room_opcode,
        directory_id: directory.id,
      });
    } else {
      res.status(200).json({
        msg: "Room not found",
      });
    }
  } catch (err) {
    res.status(500).json({
      msg: err,
    });
  }
});

router.delete("/leaveChat", authenticate, async (req, res) => {
  const { id } = req.body;
  try {
    const room = await prisma.message.delete({
      where: {
        id,
      },
    });
    if (room) {
      res.status(204).json({
        msg: "User left the room",
        raw_data: room,
      });
    } else {
      res.status(200).json({
        msg: "could not delete room",
      });
    }
  } catch (err) {
    res.status(500).json({
      msg: err,
    });
  }
});

router.get("/getMembers/:room_id", authenticate, async (req, res) => {
  const room_id = req.params.room_id;
  try {
    const resp = await prisma.directory.findMany({
      where: {
        chat_id: room_id,
      },
      select: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            status: true,
            avatarurl: true,
          },
        },
      },
    });
    const activeMemberIds =
      RedisSubscriptionManager.get_instance().getRoomMembers(room_id);
    const member_info = resp.map(({ user }) => {
      const { id, ...details } = user;
      const maybe_active = activeMemberIds.has(details.username);

      if (maybe_active === undefined || maybe_active === false)
        return {
          ...details,
          active: false,
        };

      return {
        ...details,
        active: true,
      };
    });

    return res.status(200).json({
      msg: "successfull",
      raw_data: member_info,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Could not fetch members",
      err,
    });
  }
});
export default router;
