from .base import MemoryStore

class InMemoryStore(MemoryStore):
    def __init__(self):
        self._storage = {}

    def get_messages(self, session_id: str):
        return self._storage.get(session_id, [])

    def add_message(self, session_id: str, message: dict):
        if session_id not in self._storage:
            self._storage[session_id] = []
        self._storage[session_id].append(message)