from twisted.internet import gtk3reactor
gtk3reactor.install()

from twisted.trial import unittest
from twisted.internet import defer
from autobahn.websocket import WebSocketClientFactory
from autobahn.websocket import WebSocketClientProtocol
from autobahn.websocket import connectWS

from gwebsockets.server import Server


class Protocol(WebSocketClientProtocol):
    def onConnect(self, response):
        self.sendMessage("Hello")

    def onMessage(self, message, binary):
        self.factory.message_cb(message)


class TestServer(unittest.TestCase):
    def setUp(self):
        self._server = Server()
        port = self._server.start()

        address = "ws://localhost:%d" % port

        factory = WebSocketClientFactory(address)
        factory.protocol = Protocol
        factory.setProtocolOptions(openHandshakeTimeout=0)

        self._connector = connectWS(factory)

        self._client_factory = factory

    def tearDown(self):
        self._close_deferred = defer.Deferred()
        return self._close_deferred

    def test_send_many_messages(self):
        self._n_messages = 5

        def message_received_cb(session, message):
            for i in range(0, 5):
                session.send_message("Hello")

        def session_started_cb(server, session):
            session.connect("message-received", message_received_cb)

        def client_message_cb(message):
            self._n_messages = self._n_messages - 1
            if self._n_messages == 0:
                self._connector.disconnect()
                self._close_deferred.callback(self)

        self._client_factory.message_cb = client_message_cb
        self._server.connect("session-started", session_started_cb)

    def test_send_one_message(self):
        def message_received_cb(session, message):
            session.send_message("Hello")

        def session_started_cb(server, session):
            session.connect("message-received", message_received_cb)

        def client_message_cb(message):
            self._connector.disconnect()
            self._close_deferred.callback(self)

        self._client_factory.message_cb = client_message_cb
        self._server.connect("session-started", session_started_cb)
