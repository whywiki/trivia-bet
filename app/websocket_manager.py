from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[int, List[WebSocket]] = {}

    async def connect(self, game_id: int, websocket: WebSocket):
        await websocket.accept()
        if game_id not in self.rooms:
            self.rooms[game_id] = []
        self.rooms[game_id].append(websocket)

    def disconnect(self, game_id: int, websocket: WebSocket):
        if game_id in self.rooms:
            if websocket in self.rooms[game_id]:
                self.rooms[game_id].remove(websocket)
            if not self.rooms[game_id]:
                del self.rooms[game_id]

    async def broadcast(self, game_id: int, message: dict):
        if game_id not in self.rooms:
            return
        dead = []
        for connection in self.rooms[game_id]:
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for connection in dead:
            self.rooms[game_id].remove(connection)
        if game_id in self.rooms and not self.rooms[game_id]:
            del self.rooms[game_id]

manager = ConnectionManager()
