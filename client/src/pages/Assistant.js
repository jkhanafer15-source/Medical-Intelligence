import React, {
  useEffect,
  useState
} from "react";

import {
  Send,
  User,
  Bot,
  FileText,
  Plus,
  X
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import MobileNavbar from "../components/MobileNavbar";
import Topbar from "../components/Topbar";
import SourceCard from "../components/Sourcecard";

import "../styles/assistant.css";


function Assistant() {

  // ========================================
  // INITIAL MESSAGE
  // ========================================

  const getInitialMessages = () => [

    {
      id: "welcome",

      sender: "assistant",

      text:
        "Hello Doctor. Ask me questions about the medical transcription knowledge base.",

      sources: [],

      fileName: null
    }

  ];


  // ========================================
  // STATES
  // ========================================

  const [message, setMessage] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [
    conversationId,
    setConversationId
  ] = useState(null);

  const [
    conversations,
    setConversations
  ] = useState([]);

  const [
    messages,
    setMessages
  ] = useState(
    getInitialMessages()
  );

  const [
    loadingConversations,
    setLoadingConversations
  ] = useState(false);

  const [
    isSending,
    setIsSending
  ] = useState(false);


  // ========================================
  // GET TOKEN
  // ========================================

  const getToken = () => {

    return localStorage.getItem(
      "access_token"
    );

  };


  // ========================================
  // FORMAT SOURCES
  // ========================================

  const formatSources = (
    sources
  ) => {

    if (!sources) {
      return [];
    }


    let parsedSources =
      sources;


    // MySQL JSON may sometimes
    // arrive as a JSON string

    if (
      typeof parsedSources ===
      "string"
    ) {

      try {

        parsedSources =
          JSON.parse(
            parsedSources
          );

      }

      catch (error) {

        console.error(
          "Source JSON error:",
          error
        );

        return [];

      }

    }


    if (
      !Array.isArray(
        parsedSources
      )
    ) {

      return [];

    }


    return parsedSources.map(
      source => ({

        title:
          source.title ||
          source.id ||
          "Medical Source",

        specialty:
          source.source_type ===
          "pdf"

            ? "Uploaded PDF"

            : source.specialty ||
              "Medical Transcription",

        text:
          source.document ||
          source.text ||
          ""

      })
    );

  };


  // ========================================
  // GET USER CONVERSATIONS
  // ========================================

  const fetchConversations =
    async () => {

      const token =
        getToken();


      if (!token) {

        console.error(
          "No access token"
        );

        return;

      }


      try {

        setLoadingConversations(
          true
        );


        const response =
          await fetch(
            "http://127.0.0.1:8000/conversations",
            {
              method: "GET",

              headers: {

                Authorization:
                  `Bearer ${token}`

              }
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Could not load conversations"
          );

        }


        setConversations(
          data.conversations || []
        );


        console.log(
          "Conversations:",
          data.conversations
        );

      }

      catch (error) {

        console.error(
          "LOAD CONVERSATIONS ERROR:",
          error
        );

      }

      finally {

        setLoadingConversations(
          false
        );

      }

    };


  // ========================================
  // LOAD CONVERSATIONS ON PAGE OPEN
  // ========================================

  useEffect(
    () => {

      fetchConversations();

    },
    []
  );


  // ========================================
  // LOAD ONE CONVERSATION
  // ========================================

  const loadConversation =
    async (
      selectedConversationId
    ) => {

      const token =
        getToken();


      if (!token) {

        return;

      }


      try {

        const response =
          await fetch(
            `http://127.0.0.1:8000/conversations/${selectedConversationId}/messages`,
            {
              method: "GET",

              headers: {

                Authorization:
                  `Bearer ${token}`

              }
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.detail ||
            "Could not load conversation"
          );

        }


        const loadedMessages =
          (data.messages || [])
            .map(
              currentMessage => ({

                id:
                  currentMessage.id,

                sender:
                  currentMessage.sender,

                text:
                  currentMessage.text,

                fileName:
                  currentMessage.file_name ||
                  null,

                sources:
                  formatSources(
                    currentMessage.sources
                  )

              })
            );


        setConversationId(
          selectedConversationId
        );


        if (
          loadedMessages.length > 0
        ) {

          setMessages(
            loadedMessages
          );

        }

        else {

          setMessages(
            getInitialMessages()
          );

        }


        setMessage("");
        setFile(null);


        console.log(
          "Loaded conversation:",
          selectedConversationId
        );

      }

      catch (error) {

        console.error(
          "LOAD MESSAGES ERROR:",
          error
        );

      }

    };


  // ========================================
  // NEW CHAT
  // ========================================

  const handleNewChat = () => {

    setConversationId(
      null
    );

    setMessages(
      getInitialMessages()
    );

    setMessage("");

    setFile(null);

  };


  // ========================================
  // CREATE CONVERSATION
  // ========================================

  const createConversation =
    async () => {

      const token =
        getToken();


      if (!token) {

        throw new Error(
          "User is not logged in."
        );

      }


      const response =
        await fetch(
          "http://127.0.0.1:8000/conversations",
          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body: JSON.stringify({
              title: "New Chat"
            })
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Conversation could not be created."
        );

      }


      console.log(
        "Conversation created:",
        data
      );


      return data.conversation.id;

    };


  // ========================================
  // SAVE MESSAGE
  // ========================================

  const saveMessage =
    async (
      currentConversationId,
      sender,
      text,
      fileName = null,
      sources = null
    ) => {

      const token =
        getToken();


      if (!token) {

        throw new Error(
          "User is not logged in."
        );

      }


      const response =
        await fetch(
          "http://127.0.0.1:8000/messages",
          {
            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`

            },

            body: JSON.stringify({

              conversation_id:
                currentConversationId,

              sender:
                sender,

              text:
                text,

              file_name:
                fileName,

              sources:
                sources

            })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.detail ||
          "Message could not be saved."
        );

      }


      console.log(
        "Message saved:",
        data
      );


      return data;

    };


  // ========================================
  // SEND MESSAGE
  // ========================================

  async function handleSend() {

    if (isSending) {
      return;
    }


    if (
      !message.trim() &&
      !file
    ) {

      return;

    }


    const currentQuestion =
      message.trim();

    const currentFile =
      file;


    try {

      setIsSending(
        true
      );


      // ========================================
      // TOKEN
      // ========================================

      const token =
        getToken();


      if (!token) {

        throw new Error(
          "You must login first."
        );

      }


      // ========================================
      // CREATE CONVERSATION
      // ========================================

      let currentConversationId =
        conversationId;


      if (!currentConversationId) {

        currentConversationId =
          await createConversation();


        setConversationId(
          currentConversationId
        );


        console.log(
          "New conversation ID:",
          currentConversationId
        );

      }


      // ========================================
      // USER MESSAGE FOR UI
      // ========================================

      const userMessage = {

        id:
          Date.now(),

        sender:
          "user",

        text:
          currentQuestion ||
          "PDF document uploaded.",

        sources: [],

        fileName:
          currentFile
            ? currentFile.name
            : null

      };


      setMessages(
        previous => [
          ...previous,
          userMessage
        ]
      );


      // ========================================
      // SAVE USER MESSAGE
      // ========================================

      await saveMessage(

        currentConversationId,

        "user",

        currentQuestion ||
          "PDF document uploaded.",

        currentFile
          ? currentFile.name
          : null,

        null

      );


      // ========================================
      // CLEAR INPUT
      // ========================================

      setMessage("");
      setFile(null);


      // ========================================
      // FORM DATA
      // ========================================

      const formData =
        new FormData();


      formData.append(
        "question",
        currentQuestion
      );


      if (currentFile) {

        formData.append(
          "file",
          currentFile
        );

      }


      // ========================================
      // RAG
      // ========================================

      const response =
        await fetch(
          "http://127.0.0.1:8000/chat",
          {
            method: "POST",

            headers: {

              Authorization:
                `Bearer ${token}`

            },

            body:
              formData
          }
        );


      const responseText =
        await response.text();


      console.log(
        "CHAT STATUS:",
        response.status
      );


      console.log(
        "RAW RESPONSE:",
        responseText
      );


      if (!response.ok) {

        throw new Error(
          responseText
        );

      }


      const data =
        JSON.parse(
          responseText
        );


      // ========================================
      // SAVE ASSISTANT MESSAGE
      // ========================================

      await saveMessage(

        currentConversationId,

        "assistant",

        data.answer,

        null,

        data.sources || null

      );


      // ========================================
      // FORMAT SOURCES
      // ========================================

      const formattedSources =
        formatSources(
          data.sources
        );


      // ========================================
      // ASSISTANT MESSAGE FOR UI
      // ========================================

      const assistantMessage = {

        id:
          Date.now() + 1,

        sender:
          "assistant",

        text:
          data.answer,

        sources:
          formattedSources,

        fileName:
          null

      };


      setMessages(
        previous => [
          ...previous,
          assistantMessage
        ]
      );


      // Refresh chat history
      await fetchConversations();

    }

    catch (error) {

      console.error(
        "CHAT ERROR:",
        error
      );


      setMessages(
        previous => [
          ...previous,

          {

            id:
              Date.now() + 1,

            sender:
              "assistant",

            text:
              `Unable to get a response. ${error.message}`,

            sources: [],

            fileName:
              null

          }

        ]
      );

    }

    finally {

      setIsSending(
        false
      );

    }

  }


  // ========================================
  // ENTER KEY
  // ========================================

  function handleKeyDown(
    event
  ) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();

    }

  }


  // ========================================
  // FILE SELECT
  // ========================================

  const handleFileChange = (
    event
  ) => {

    const selectedFile =
      event.target.files?.[0];


    if (!selectedFile) {

      return;

    }


    if (
      selectedFile.type !==
      "application/pdf"
    ) {

      alert(
        "Please select a PDF file."
      );

      event.target.value = "";

      return;

    }


    if (
      selectedFile.size === 0
    ) {

      alert(
        "The selected PDF is empty."
      );

      event.target.value = "";

      return;

    }


    setFile(
      selectedFile
    );

  };


  // ========================================
  // UI
  // ========================================

  return (

    <div className="appLayout">

      <Sidebar />


      <div className="mainContent">

        <MobileNavbar />

        <Topbar />


        <main className="assistantPage">


          {/* ====================== */}
          {/* HEADER */}
          {/* ====================== */}

          <section className="assistantHeader">

            <div>

              <span className="assistantLabel">

                Medical RAG Assistant

              </span>


              <h1>

                AI Medical Assistant

              </h1>


              <p>

                Ask questions about the
                medical transcription
                knowledge base and retrieve
                evidence-grounded information.

              </p>

            </div>


            <div className="assistantStatus">

              <span></span>

              RAG Ready

            </div>

          </section>


          {/* ====================== */}
          {/* CONVERSATION HISTORY */}
          {/* ====================== */}

          <section className="conversationHistory">

            <div className="conversationHistoryHeader">

              <h3>
                Previous Chats
              </h3>


              <button
                type="button"
                className="newChatButton"
                onClick={
                  handleNewChat
                }
              >

                <Plus size={16} />

                New Chat

              </button>

            </div>


            <div className="conversationList">

              {
                loadingConversations
                  ? (

                    <p>
                      Loading chats...
                    </p>

                  )

                  : conversations.length === 0
                    ? (

                      <p>
                        No previous chats.
                      </p>

                    )

                    : conversations.map(
                        conversation => (

                          <button

                            key={
                              conversation.id
                            }

                            type="button"

                            onClick={() =>
                              loadConversation(
                                conversation.id
                              )
                            }

                            className={
                              conversationId ===
                              conversation.id

                                ? "conversationItem activeConversation"

                                : "conversationItem"
                            }

                          >

                            <span>

                              {
                                conversation.title
                              }

                            </span>


                            <small>

                              Chat #
                              {
                                conversation.id
                              }

                            </small>

                          </button>

                        )
                      )
              }

            </div>

          </section>


          {/* ====================== */}
          {/* CHAT */}
          {/* ====================== */}

          <section className="chatContainer">


            {/* ====================== */}
            {/* MESSAGES */}
            {/* ====================== */}

            <div className="messagesArea">

              {
                messages.map(
                  currentMessage => (

                    <div

                      key={
                        currentMessage.id
                      }

                      className={
                        currentMessage.sender ===
                        "user"

                          ? "messageRow userMessageRow"

                          : "messageRow assistantMessageRow"
                      }

                    >


                      <div

                        className={
                          currentMessage.sender ===
                          "user"

                            ? "messageAvatar userAvatar"

                            : "messageAvatar aiAvatar"
                        }

                      >

                        {
                          currentMessage.sender ===
                          "user"

                            ? <User size={18} />

                            : <Bot size={18} />
                        }

                      </div>


                      <div

                        className={
                          currentMessage.sender ===
                          "user"

                            ? "messageBubble userBubble"

                            : "messageBubble assistantBubble"
                        }

                      >


                        <p>

                          {
                            currentMessage.text
                          }

                        </p>


                        {
                          currentMessage.fileName && (

                            <div className="messageAttachment">

                              <FileText
                                size={16}
                              />

                              <span>

                                {
                                  currentMessage.fileName
                                }

                              </span>

                            </div>

                          )
                        }


                        {
                          currentMessage.sources &&
                          currentMessage.sources.length > 0 && (

                            <div className="messageSources">

                              <div className="sourcesTitle">

                                <FileText
                                  size={16}
                                />

                                <span>

                                  Retrieved Sources

                                </span>

                              </div>


                              <div className="sourcesGrid">

                                {
                                  currentMessage.sources.map(
                                    (
                                      source,
                                      index
                                    ) => (

                                      <SourceCard

                                        key={
                                          index
                                        }

                                        title={
                                          source.title
                                        }

                                        specialty={
                                          source.specialty
                                        }

                                        text={
                                          source.text
                                        }

                                      />

                                    )
                                  )
                                }

                              </div>

                            </div>

                          )
                        }


                      </div>

                    </div>

                  )
                )
              }

            </div>


            {/* ====================== */}
            {/* SUGGESTIONS */}
            {/* ====================== */}

            <div className="suggestedQuestions">

              <button
                onClick={() =>
                  setMessage(
                    "Find medical records discussing atrial fibrillation."
                  )
                }
              >

                Find records about
                atrial fibrillation

              </button>


              <button
                onClick={() =>
                  setMessage(
                    "Show transcriptions mentioning hypertension."
                  )
                }
              >

                Find hypertension records

              </button>


              <button
                onClick={() =>
                  setMessage(
                    "Summarize records related to chest pain."
                  )
                }
              >

                Summarize chest pain records

              </button>

            </div>


            {/* ====================== */}
            {/* INPUT */}
            {/* ====================== */}

            <div className="chatInputContainer">


              {
                file && (

                  <div className="selectedFile">

                    <FileText
                      size={17}
                    />


                    <div className="selectedFileInfo">

                      <span>
                        PDF
                      </span>

                      <strong>

                        {file.name}

                      </strong>

                    </div>


                    <button
                      type="button"
                      onClick={() =>
                        setFile(null)
                      }
                    >

                      <X size={16} />

                    </button>

                  </div>

                )
              }


              <div className="chatInput">


                <label
                  className="fileUploadButton"
                  title="Upload PDF"
                >

                  <Plus size={21} />


                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={
                      handleFileChange
                    }
                  />

                </label>


                <textarea

                  placeholder="Ask a question or upload a PDF..."

                  value={
                    message
                  }

                  onChange={
                    event =>
                      setMessage(
                        event.target.value
                      )
                  }

                  onKeyDown={
                    handleKeyDown
                  }

                  rows="1"

                />


                <button

                  className="sendButton"

                  onClick={
                    handleSend
                  }

                  disabled={
                    isSending ||
                    (
                      !message.trim() &&
                      !file
                    )
                  }

                >

                  <Send size={18} />

                </button>


              </div>


              <p className="assistantDisclaimer">

                Responses are generated
                from retrieved medical
                documents and should be
                verified against the source
                records.

              </p>


            </div>


          </section>


        </main>

      </div>

    </div>

  );

}


export default Assistant;