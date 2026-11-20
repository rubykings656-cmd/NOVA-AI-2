
const NOVA_API =
  "https://nova-ai-2.rubykings656.workers.dev";

const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("message");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("sendButton");

function addMessage(sender, text) {
  const paragraph = document.createElement("p");
  const label = document.createElement("strong");

  label.textContent = sender + ": ";
  paragraph.appendChild(label);
  paragraph.appendChild(document.createTextNode(text));

  messages.appendChild(paragraph);
  messages.scrollTop = messages.scrollHeight;
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!message || sendButton.disabled) return;

  addMessage("You", message);

  messageInput.value = "";
  sendButton.disabled = true;
  sendButton.textContent = "Thinking...";

  try {
    const response = await fetch(NOVA_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "AI service returned an error."
      );
    }

    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("NOVA returned an empty response.");
    }

    addMessage("NOVA AI", data.reply);

  } catch (error) {
    addMessage(
      "NOVA AI Error",
      error.message || "Connection failed. Please try again."
    );

  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "Send";
    messageInput.focus();
  }
});
