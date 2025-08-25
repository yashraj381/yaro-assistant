// App bootstrapping and routing

window.onload = () => {
  if(!session.name || !session.family || !session.role) authScreen();
  else session.role === "child" ? childScreen() : parentScreen();
};