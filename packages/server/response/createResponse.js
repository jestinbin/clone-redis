export default (socket) => (message) => {
  socket.write(`${message}\n`);
};
