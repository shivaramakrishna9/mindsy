import React from "react";
import Axios from "axios";
import { toast } from "react-toastify";
import Toggle from "react-toggle";
import SwipeableViews from "react-swipeable-views";
import { Link } from "react-router-dom";
import GaugeChart from "react-gauge-chart";
import autosize from "autosize";
import Modal from "react-modal";
import { Line, Bar } from "react-chartjs-2";
import jsPDF from "jspdf";
import {
  Grid,
  Edit,
  PlayCircle,
  X,
  XCircle,
  Trash2,
  Edit3,
  BarChart2,
  Activity,
  Download,
} from "react-feather";
import { AntTab, AntTabs } from "./Course";
import { RenderQuestion, RenderQuestionTextual } from "./QuizQuestion";
import { customStyles } from "./QuizQuestion";
import { EmptyStateSmall } from "./EmptyState";
import { getRandomUser } from "./random";
import userImage from "../assets/user.png";
import userImage3 from "../assets/user3.png";
import userImage4 from "../assets/user4.png";
import "react-toggle/style.css";
import "jspdf-autotable";
import "./css/Course.css";
import "./css/CreateCourse.css";

let userType = JSON.parse(localStorage.getItem("userType"));

let localdata = JSON.parse(localStorage.getItem("userDetails"));
let user = localdata
  ? localdata
  : {
      fName: "",
      lName: "",
      email: "",
      password: "",
      _id: "404",
    };

const generatePDF = (tickets) => {
  const doc = new jsPDF();
  const tableColumn = ["Name", "Questions Attempted", "Marks"];

  const tableRows = [];
  if (!tickets.length) return;

  tickets.forEach((ticket) => {
    const ticketData = [
      ticket.student_name,
      (ticket.questions_attempted + "")
        .concat(" / ")
        .concat(ticket.no_of_questions + ""),
      (ticket.marks_obtained + "")
        .concat(" / ")
        .concat(ticket.total_marks + ""),
    ];

    tableRows.push(ticketData);
  });

  doc.autoTable(tableColumn, tableRows, { startY: 40 });

  doc.addFont("Helvetica", "Helvetica", "");
  doc.setFontSize(22);
  doc.setFont("Helvetica", "bold");
  doc.text("Quiz Assessment Report", 15, 20);

  doc.setFontSize(16);
  doc.setFont("Helvetica", "");
  doc.text(`Quiz was submitted by ${tickets.length} students`, 15, 30);

  doc.save(`report.pdf`);
};

const Quiz = ({ history }) => {
  const [index, setIndex] = React.useState(0);

  const handleChange = (event, value) => setIndex(value);
  const handleChangeIndex = (index) => setIndex(index);

  const [ignore, setIgnore] = React.useState(0);
  const [modalIsOpen, setModal] = React.useState(false);
  const [modalIsOpenResult, setModalResult] = React.useState(false);
  const [modalIsOpenRename, setModalIsOpenRename] = React.useState(false);
  const [quizResponse, setQuizResponse] = React.useState(null);
  const [quizNewName, setQuizNewName] = React.useState("");

  const [chart, setChart] = React.useState("bar");
  const [answers, setAnswers] = React.useState([]);

  const [quizInfo, setQuizInfo] = React.useState(null);
  const [questions, setQuestions] = React.useState([]);
  const [isActive, setIsActive] = React.useState(
    quizInfo ? quizInfo.is_active : false
  );
  const [hasSubmitted, setHasSubmitted] = React.useState(false);
  const [quizResults, setQuizResults] = React.useState([]);

  const [topper, setTopper] = React.useState(null);
  const [avg, setAvg] = React.useState(0);

  const openModal = () => setModal(true);
  const closeModal = () => setModal(false);
  const openModalResult = () => setModalResult(true);
  const closeModalResult = () => setModalResult(false);
  const openModalRename = () => setModalIsOpenRename(true);
  const closeModalRename = () => setModalIsOpenRename(false);
  const forceUpdate = React.useCallback(() => setIgnore((v) => v + 1), []);
  let quizAnswers = null;

  React.useEffect(() => {
    let loc = window.location.href.split("/");
    let quizid = loc[loc.length - 1];
    Axios.get(`/api/quiz/${quizid}`).then((res) => {
      if (res.data.success) {
        setQuizInfo(res.data.data);
        setIsActive(res.data.data.is_active);
      }
    });
  }, [isActive, modalIsOpenRename, hasSubmitted]);

  React.useEffect(() => {
    let loc = window.location.href.split("/");
    let quizid = loc[loc.length - 1];
    if (userType === "student") {
      Axios.get(`/api/quiz/hasSubmitted/${quizid}/${user._id}`).then((res) => {
        if (res.data.data) {
          setHasSubmitted(true);
        }
      });
    }
  }, []);

  React.useEffect(() => {
    window.scroll({ top: 0, left: 0, behavior: "smooth" });
    let loc = window.location.href.split("/");
    let quizid = loc[loc.length - 1];
    Axios.get(`/api/quizResult/${quizid}`).then((res) => {
      if (res.data.success) {
        setQuizResults(res.data.data);
      }
    });
  }, []);

  React.useEffect(() => {
    let quizID = quizInfo ? quizInfo._id : null;
    Axios.get(`/api/questions/${quizID}`).then((res) => {
      if (res.data.success) {
        let question = res.data.data;
        setQuestions(question);
      }
    });
  }, [quizInfo]);

  const MarksRowHeading = () => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 50,
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: "1px solid",
          marginRight: 20,
          marginLeft: 10,
          marginTop: 20,
        }}
        className="borderr"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexDirection: "row",
              marginLeft: 10,
              marginRight: 10,
            }}
          ></div>
          <p
            style={{
              fontFamily: "Poppins",
              fontSize: 15,
              fontWeight: 500,
              textAlign: "left",
              verticalAlign: "middle",
              margin: 0,
              padding: 0,
              paddingLeft: 20,
              letterSpacing: 0.5,
              flexGrow: 1,
            }}
            className="changeColor"
          >
            NAME
          </p>
          <p
            style={{
              fontFamily: "Poppins",
              fontSize: 15,
              fontWeight: 500,
              textAlign: "center",
              verticalAlign: "middle",
              margin: 0,
              padding: 0,
              paddingLeft: 0,
              letterSpacing: 0.5,
              width: 200,
            }}
            className="changeColor"
          >
            QUES ATTEMPTED
          </p>
          <p
            style={{
              fontFamily: "Poppins",
              fontSize: 15,
              fontWeight: 500,
              textAlign: "center",
              verticalAlign: "middle",
              margin: 0,
              padding: 0,
              paddingLeft: 0,
              letterSpacing: 0.5,
              width: 200,
            }}
            className="changeColor"
          >
            MARKS OBTAINED
          </p>
        </div>
      </div>
    );
  };

  const MarksRow = ({
    student_id,
    student_name,
    marks_obtained,
    total_marks,
    ques_attempted,
    no_of_ques,
  }) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          height: 50,
          marginBottom: 20,
          paddingBottom: 20,
          borderBottom: "1px solid",
          marginRight: 20,
          marginLeft: 10,
        }}
        className="borderr"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            className="changeColorBG"
            style={{
              width: 40,
              height: 40,
              borderRadius: 25,
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexDirection: "row",
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            <img
              className="changeColorBG"
              src={getRandomUser()}
              style={{ width: 35, height: 35, marginRight: 0, marginTop: 5 }}
            />
          </div>
          <p
            style={{
              fontFamily: "Poppins",
              fontSize: 15,
              fontWeight: 500,
              textAlign: "left",
              verticalAlign: "middle",
              margin: 0,
              padding: 0,
              paddingLeft: 20,
              letterSpacing: 0.5,
              flexGrow: 1,
            }}
            className="changeColor"
          >
            {student_name}
          </p>
          <p
            style={{
              fontFamily: "Poppins",
              fontSize: 15,
              fontWeight: 500,
              textAlign: "center",
              verticalAlign: "middle",
              margin: 0,
              padding: 0,
              paddingLeft: 0,
              letterSpacing: 0.5,
              width: 200,
            }}
            className="changeColor"
          >
            {ques_attempted} / {no_of_ques}
          </p>
          <p
            style={{
              fontFamily: "Poppins",
              fontSize: 15,
              fontWeight: 500,
              textAlign: "center",
              verticalAlign: "middle",
              margin: 0,
              padding: 0,
              paddingLeft: 0,
              letterSpacing: 0.5,
              width: 200,
              color: "#6C63FF",
            }}
          >
            {marks_obtained} / {total_marks}
          </p>
        </div>
      </div>
    );
  };

  const RenderQuizForStudent = () => {
    const textRef = React.useRef();

    React.useEffect(() => {
      autosize(document.querySelectorAll("textarea"));
    });

    let questionsArray = questions
      ? questions.sort((a, b) => (a.question_id > b.question_id ? 1 : -1))
      : null;

    const handleMCQAnswer = (index, option) => {
      let answersArr = [...answers];
      answersArr[index] = option;
      setAnswers(answersArr);
    };

    quizAnswers = answers;

    return questionsArray.map((question, index) => {
      if (question.question_type === "mcq") {
        return (
          <div
            style={{
              width: "100%",
              height: "auto",
              margin: "0 0 25px 0",
              zIndex: 0,
              display: "flex",
              flexDirection: "row",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-end",
                  marginBottom: 15,
                }}
              >
                <p
                  className="changeColor"
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    margin: "5px 0",
                    fontFamily: "Poppins",
                    letterSpacing: 0.4,
                    padding: 0,
                    marginRight: 15,
                  }}
                >
                  Q.{index + 1}
                </p>
                <p
                  className="changeColor"
                  style={{
                    fontSize: 17,
                    fontWeight: 600,
                    margin: "5px 0",
                    fontFamily: "Poppins",
                    letterSpacing: 0.4,
                    padding: 0,
                  }}
                >
                  {question.question_title}
                </p>
                <p
                  className="sub"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    margin: "5px 0",
                    fontFamily: "Poppins",
                    letterSpacing: 0.4,
                    padding: 0,
                    marginLeft: 10,
                  }}
                >
                  1 mark
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 13,
                  cursor: "pointer",
                }}
                onClick={() => handleMCQAnswer(index, 1)}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    margin: "3px 10px 3px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className={" mcqhover"}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      margin: 0,
                      backgroundColor: "#6C63FF",
                      display: answers[index] == 1 ? "block" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 10,
                        margin: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="background"
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 10,
                          margin: 3.2,
                          backgroundColor: "#6C63FF",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p
                  className="sub"
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    margin: "2px 0",
                    fontFamily: "Poppins",
                    letterSpacing: 0.4,
                    padding: 0,
                  }}
                >
                  {question.option_1}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 13,
                  cursor: "pointer",
                }}
                onClick={() => handleMCQAnswer(index, 2)}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    margin: "3px 10px 3px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className={" mcqhover"}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      margin: 0,
                      backgroundColor: "#6C63FF",
                      display: answers[index] == 2 ? "block" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 10,
                        margin: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="background"
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 10,
                          margin: 3.2,
                          backgroundColor: "#6C63FF",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p
                  className="sub"
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    margin: "2px 0",
                    fontFamily: "Poppins",
                    letterSpacing: 0.4,
                    padding: 0,
                  }}
                >
                  {question.option_2}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 13,
                  cursor: "pointer",
                }}
                onClick={() => handleMCQAnswer(index, 3)}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    margin: "3px 10px 3px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className={" mcqhover"}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      margin: 0,
                      backgroundColor: "#6C63FF",
                      display: answers[index] == 3 ? "block" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 10,
                        margin: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="background"
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 10,
                          margin: 3.2,
                          backgroundColor: "#6C63FF",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p
                  className="sub"
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    margin: "2px 0",
                    fontFamily: "Poppins",
                    letterSpacing: 0.4,
                    padding: 0,
                  }}
                >
                  {question.option_3}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 13,
                  cursor: "pointer",
                }}
                onClick={() => handleMCQAnswer(index, 4)}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    margin: "3px 10px 3px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  className={" mcqhover"}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      margin: 0,
                      backgroundColor: "#6C63FF",
                      display: answers[index] == 4 ? "block" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 10,
                        margin: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="background"
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 10,
                          margin: 3.2,
                          backgroundColor: "#6C63FF",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                <p
                  className="sub"
                  style={{
                    fontSize: 15,
                    fontWeight: 500,
                    margin: "2px 0",
                    fontFamily: "Poppins",
                    letterSpacing: 0.4,
                    padding: 0,
                  }}
                >
                  {question.option_4}
                </p>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div
            style={{
              width: "88%",
              height: "auto",
              margin: "0 0 25px 0",
              zIndex: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                marginBottom: 5,
              }}
            >
              <p
                className="changeColor"
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  margin: "5px 0",
                  fontFamily: "Poppins",
                  letterSpacing: 0.4,
                  padding: 0,
                  marginRight: 15,
                }}
              >
                Q.{index + 1}
              </p>
              <p
                className="changeColor"
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  margin: "5px 0",
                  fontFamily: "Poppins",
                  letterSpacing: 0.4,
                  padding: 0,
                }}
              >
                {question.question_title}
              </p>
              <p
                className="sub"
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  margin: "5px 0",
                  fontFamily: "Poppins",
                  letterSpacing: 0.4,
                  padding: 0,
                  marginLeft: 10,
                }}
              >
                {question.textual_ques_marks} marks
              </p>
            </div>
            <textarea
              onBlur={(t) => {
                let arr = [...answers];
                arr[question.question_id] = t.target.value;
                setAnswers(arr);
              }}
              defaultValue={answers[question.question_id]}
              placeholder="Start typing your answer here..."
              ref={textRef}
            ></textarea>
          </div>
        );
      }
    });
  };

  const calculateScore = (questions, answers) => {
    let score = 0;
    let questionsAttempted = 0;

    questions.map((ques, index) => {
      if (ques.question_type === "mcq") {
        if (answers[index]) {
          if (answers[index] === ques.correct_option) {
            score++;
          }
          questionsAttempted++;
        }
      } else {
        if (answers[index]) {
          let presentKeywords = 0;
          let charPercent = 0;

          ques.keywords.map((keyword) => {
            if (answers[index].includes(keyword, 0)) {
              presentKeywords++;
            }
          });

          const keywordPercent = parseFloat(
            presentKeywords / ques.keywords.length
          ).toFixed(2);

          if (answers[index].trim().length > ques.min_char) {
            charPercent = 1;
          } else {
            charPercent = parseFloat(
              (answers[index].trim().length / ques.min_char).toFixed(2)
            );
          }

          const textScore =
            parseFloat(
              (ques.textual_ques_marks * 0.8 * keywordPercent).toFixed(2)
            ) +
            parseFloat(
              (ques.textual_ques_marks * 0.2 * charPercent).toFixed(2)
            );

          score += Math.round(textScore);

          questionsAttempted++;
        }
      }
    });

    return { score, questionsAttempted };
  };

  const submitQuiz = () => {
    let loc = window.location.href.split("/");
    let score = calculateScore(questions, quizAnswers);
    let textualMarks = [];
    let questions1 = questions;
    questions1
      .filter((q) => q.question_type === "text")
      .forEach((q) => textualMarks.push(q.textual_ques_marks));
    let totalMarks =
      questions1.filter((q) => q.question_type === "mcq").length +
      textualMarks.reduce((a, b) => a + b, 0);

    let responseObj = {
      quiz_id: loc[loc.length - 1],
      student_id: user._id,
      no_of_questions: questions1.length,
      total_marks: totalMarks,
      marks_obtained: score.score,
      questions_attempted: score.questionsAttempted,
      student_name: user.fName.concat(" ").concat(user.lName),
    };
    setQuizResponse(responseObj);
    openModal();
  };

  const postQuizSubmission = () => {
    if (quizInfo) {
      if (!quizInfo.is_active) {
        return toast.error("Quiz submission is closed");
      }
    }
    Axios.post("/api/submitQuiz", quizResponse)
      .then((res) => {
        if (res.data.success) {
          openModalResult();
        } else {
          toast.error("You have already submitted this quiz");
        }
      })
      .catch((e) => toast.error("You have already submitted this quiz"));
  };

  const startQuiz = () => {
    setIsActive(true);
    forceUpdate();
    Axios.post(`/api/startQuiz/${quizInfo._id}`).then((res) => {
      if (res.data.success) {
      }
    });
  };

  const endQuiz = () => {
    setIsActive(false);
    forceUpdate();
    Axios.post(`/api/endQuiz/${quizInfo._id}`).then((res) => {
      if (res.data.success) {
      }
    });
  };

  const deleteQuiz = () => {
    let loc = window.location.href.split("/");
    let quizID = loc[loc.length - 1];
    let courseId = "";
    Axios.post(`/api/deleteQuiz/${quizID}`)
      .then((res) => {
        courseId = res.data.data.course_id;
        if (res.data.success) {
          Axios.post(`/api/deleteQuestion/${quizID}`).then((res1) => {
            if (res1.data.success) {
              Axios.post(`/api/deleteSubmission/${quizID}`).then((res2) => {
                if (res2.data.success) {
                  toast.success("Deleted quiz successfully");
                  setTimeout(() => {
                    window.location.href = `/course/${courseId}`;
                  }, 3000);
                }
              });
            }
          });
        }
      })
      .catch(() => toast.error("Error deleting quiz"));
  };

  const renameQuiz = () => {
    let quizID = quizInfo._id;
    Axios.post(`/api/quiz/changeName/${quizID}`, {
      quiz_name: quizNewName,
    }).then((res) => {
      if (res.data.success) {
        setQuizNewName("");
        toast.success("Quiz name updated");
      }
    });
  };

  React.useEffect(() => {
    const topper1 = quizResults.length
      ? quizResults.reduce(function (prev, current) {
          return prev.marks_obtained > current.marks_obtained ? prev : current;
        })
      : null;
    setTopper(topper1);

    let avg1 = quizResults
      ? quizResults
          .filter((s) => s.marks_obtained)
          .reduce((r, c) => r + c.marks_obtained, 0) / quizResults.length
      : null;
    setAvg(avg1.toFixed(2));
  }, [quizResults]);

  return (
    <div
      className={"background course-container"}
      style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 70 }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginTop: 25,
          marginLeft: 20,
        }}
      >
        <h2 className="course-title" style={{ fontSize: 30, margin: 0 }}>
          {quizInfo ? quizInfo.quiz_title : null}
        </h2>
      </div>

      <div
        className={"new-post boxshadow"}
        style={{
          width: 60,
          height: 60,
          boxShadow: "1px 1px 5px #ababab",
          display: userType === "teacher" ? "flex" : "none",
        }}
        onClick={() => generatePDF(quizResults ? quizResults : [])}
      >
        <Download size={30} color="white" />
      </div>
      {userType === "student" ? (
        <React.Fragment>
          <p
            className="changeColor"
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              margin: 0,
              fontFamily: "Poppins",
              letterSpacing: 0.3,
              padding: 0,
              marginTop: 25,
              marginLeft: 25,
            }}
          >
            INSTRUCTIONS FOR QUIZ
          </p>
          <ul style={{ margin: 0, padding: 0, marginLeft: 25, marginTop: 10 }}>
            <li>
              <p
                className="sub"
                style={{
                  fontFamily: "Poppins",
                  fontSize: 14,
                  color: "#545454",
                  fontWeight: 500,
                  margin: 0,
                  padding: 0,
                  textAlign: "left",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                This quiz contains {quizInfo ? quizInfo.no_of_questions : null}{" "}
                questions.
              </p>
            </li>
            <li>
              <p
                className="sub"
                style={{
                  fontFamily: "Poppins",
                  fontSize: 14,
                  color: "#545454",
                  fontWeight: 500,
                  margin: 0,
                  padding: 0,
                  textAlign: "left",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                For multiple choice questions, click on the option to select it.
              </p>
            </li>
            <li>
              <p
                className="sub"
                style={{
                  fontFamily: "Poppins",
                  fontSize: 14,
                  color: "#545454",
                  fontWeight: 500,
                  margin: 0,
                  padding: 0,
                  textAlign: "left",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                For textual or theoretical questions, type your answer inside
                the box.{" "}
              </p>
            </li>
            <li>
              <p
                className="sub"
                style={{
                  fontFamily: "Poppins",
                  fontSize: 14,
                  color: "#545454",
                  fontWeight: 500,
                  margin: 0,
                  padding: 0,
                  textAlign: "left",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                The quiz is submitted only after clicking the submit button. You
                will be able to view your score immediately after submission.
              </p>
            </li>
          </ul>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <p
            className="changeColor"
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              margin: 0,
              fontFamily: "Poppins",
              letterSpacing: 0.3,
              padding: 0,
              marginTop: 25,
              marginLeft: 25,
            }}
          >
            ABOUT QUIZ
          </p>
          <ul style={{ margin: 0, padding: 0, marginLeft: 25, marginTop: 10 }}>
            <li>
              <p
                className="sub"
                style={{
                  fontFamily: "Poppins",
                  fontSize: 14,
                  color: "#545454",
                  fontWeight: 500,
                  margin: 0,
                  padding: 0,
                  textAlign: "left",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                This quiz contains {quizInfo ? quizInfo.no_of_questions : null}{" "}
                questions.
              </p>
            </li>
            <li>
              <p
                className="sub"
                style={{
                  fontFamily: "Poppins",
                  fontSize: 14,
                  color: "#545454",
                  fontWeight: 500,
                  margin: 0,
                  padding: 0,
                  textAlign: "left",
                  marginTop: 0,
                  marginBottom: 0,
                }}
              >
                Student submissions will not be accepted once the quiz has
                ended.
              </p>
            </li>
          </ul>
        </React.Fragment>
      )}

      {userType === "teacher" ? (
        <React.Fragment>
          <div style={{ width: "100%", marginTop: 0 }}>
            <AntTabs
              value={index}
              fullWidth
              variant="scrollable"
              onChange={handleChange}
              style={{ paddingLeft: 10, marginTop: 10 }}
            >
              <AntTab
                label={
                  <div>
                    <Edit size={22} style={{ marginBottom: 5 }} /> Responses{" "}
                  </div>
                }
              />
              <AntTab
                label={
                  <div>
                    <Grid
                      size={22}
                      style={{ marginBottom: 5, marginRight: 5 }}
                    />{" "}
                    Questions{" "}
                  </div>
                }
              />
            </AntTabs>

            <SwipeableViews index={index} onChangeIndex={handleChangeIndex}>
              <div style={Object.assign({}, styles.slide)}>
                {quizResults.length ? (
                  <React.Fragment>
                    <p
                      className="changeColor"
                      style={{
                        fontFamily: "Poppins",
                        fontSize: 18,
                        color: "#232323",
                        fontWeight: 600,
                        margin: 0,
                        padding: 0,
                        textAlign: "left",
                        marginTop: 15,
                        marginBottom: 20,
                        marginLeft: 15,
                        letterSpacing: 0.3,
                      }}
                    >
                      Detailed Assessment Report
                    </p>
                    <MarksRowHeading />
                    {quizResults.map((result) => {
                      return (
                        <MarksRow
                          student_id={result.student_id}
                          student_name={result.student_name}
                          total_marks={result.total_marks}
                          marks_obtained={result.marks_obtained}
                          no_of_ques={result.no_of_questions}
                          ques_attempted={result.questions_attempted}
                        />
                      );
                    })}
                    <p
                      className="changeColor"
                      style={{
                        fontFamily: "Poppins",
                        fontSize: 18,
                        color: "#232323",
                        fontWeight: 600,
                        margin: 0,
                        padding: 0,
                        textAlign: "left",
                        marginTop: 45,
                        marginBottom: 20,
                        marginLeft: 15,
                        letterSpacing: 0.3,
                      }}
                    >
                      Graphical Report
                    </p>
                  </React.Fragment>
                ) : (
                  <EmptyStateSmall
                    title="No responses yet"
                    d1="No students have submitted the quiz yet. Refesh the page to check again"
                  />
                )}

                {quizResults.length ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                      marginTop: 20,
                      paddingRight: 15,
                      paddingLeft: 15,
                    }}
                  >
                    <div style={{ width: "85%" }}>
                      <div style={{ marginTop: -30, marginLeft: "92%" }}>
                        <Toggle
                          defaultChecked={chart === "line"}
                          icons={{
                            checked: (
                              <Activity
                                size={17}
                                color="#fff"
                                style={{
                                  position: "absolute",
                                  top: -2.5,
                                  left: -1,
                                }}
                              />
                            ),
                            unchecked: (
                              <BarChart2
                                size={14}
                                color="#fff"
                                style={{ position: "absolute", top: -2 }}
                              />
                            ),
                          }}
                          style={{ position: "absolute", left: 0 }}
                          className="chartToggle"
                          onChange={() =>
                            setChart(chart === "bar" ? "line" : "bar")
                          }
                        />
                      </div>

                      <div
                        className="chart"
                        style={{
                          overflow: "visible",
                          padding: 0,
                          width: "98%",
                          marginTop: 20,
                        }}
                      >
                        {chart === "line" ? (
                          <LineChart
                            quizResults={quizResults ? quizResults : []}
                          />
                        ) : (
                          <BarChartCustom
                            quizResults={quizResults ? quizResults : []}
                          />
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div className="stats-box-2">
                        <h3>Quiz Topper</h3>
                        <div className="stats-box-2-stats">
                          <div
                            className="background"
                            style={{
                              width: 45,
                              height: 45,
                              borderRadius: 25,
                              backgroundColor: "#eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                              flexDirection: "row",
                            }}
                          >
                            <img
                              className="background"
                              src={userImage3}
                              style={{
                                width: 40,
                                height: 40,
                                marginRight: 0,
                                marginTop: 5,
                              }}
                            />
                          </div>
                          <div>
                            <h2
                              style={{
                                fontSize: 20,
                                color: "#FF9800",
                                marginTop: 7,
                              }}
                            >
                              {topper ? topper.marks_obtained : null}/
                              {topper ? topper.total_marks : null}
                            </h2>
                            <p>{topper ? topper.student_name : null}</p>
                          </div>
                        </div>
                      </div>
                      <div className="stats-box-2">
                        <h3>Average Class Marks</h3>
                        <div
                          className="stats-box-2-stats"
                          style={{ flexDirection: "row", marginTop: 20 }}
                        >
                          <h2>{avg ? avg : null}</h2>
                          <BarChart2
                            size={35}
                            className="sub"
                            style={{ marginRight: 5 }}
                          />
                        </div>
                      </div>
                      <div className="stats-box-2">
                        <h3>Count</h3>
                        <div
                          className="students-box"
                          style={{ marginTop: 10, padding: 0, marginLeft: 0 }}
                        >
                          <div
                            className="students-box-circle"
                            style={{ marginLeft: 0, background: "#6C63FF" }}
                          >
                            <img src={userImage} />
                          </div>
                          <div
                            className="students-box-circle"
                            style={{
                              marginLeft: 17,
                              background: "#0F98D9",
                              transform: "scale(1.02)",
                            }}
                          >
                            <img src={userImage3} />
                          </div>
                          <div
                            className="students-box-circle"
                            style={{
                              marginLeft: 34,
                              background: "#545454",
                              transform: "scale(1.05)",
                            }}
                          >
                            <img src={userImage4} />
                          </div>
                          <p
                            className="sub"
                            style={{
                              marginLeft: 70,
                              fontFamily: "Poppins",
                              fontSize: 13,
                              color: "#434343",
                              fontWeight: 500,
                              marginTop: 30,
                            }}
                          >
                            {quizResults.length} students submitted the quiz
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                style={(Object.assign({}, styles.slide), { paddingLeft: 25 })}
              >
                <p
                  className="changeColor"
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    margin: 0,
                    fontFamily: "Poppins",
                    letterSpacing: 0.3,
                    padding: 0,
                    marginTop: 20,
                    marginBottom: 20,
                    marginLeft: 0,
                  }}
                >
                  {questions ? questions.length : null} QUESTIONS IN QUIZ
                </p>
                {questions
                  ? questions.map((q, index) => {
                      return q.question_type === "mcq" ? (
                        <RenderQuestion
                          question={q.question_title}
                          option1={q.option_1}
                          option2={q.option_2}
                          option3={q.option_3}
                          option4={q.option_4}
                          correctOption={q.correct_option}
                          question_id={q.question_id}
                          canDelete={false}
                        />
                      ) : (
                        <RenderQuestionTextual
                          question={q.question_title}
                          keywords={q.keywords}
                          question_id={q.question_id}
                          canDelete={false}
                          textualQuesMarks={q.textual_ques_marks}
                        />
                      );
                    })
                  : null}
              </div>
            </SwipeableViews>
          </div>

          <div
            style={{
              position: "absolute",
              top: 100,
              right: 25,
              display: "flex",
              flexDirection: "row-reverse",
              alignItems: "center",
            }}
          >
            {!isActive ? (
              <button
                style={{
                  paddingLeft: 15,
                  transition: "0.5s ease",
                  marginTop: 0,
                }}
                onClick={startQuiz}
              >
                <PlayCircle size={22} color="white" />
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#fff",
                    margin: 0,
                    fontFamily: "Poppins",
                    letterSpacing: 0.8,
                    marginLeft: 10,
                    marginTop: 0,
                  }}
                >
                  Begin Quiz
                </p>
              </button>
            ) : (
              <button
                style={{
                  paddingLeft: 15,
                  transition: "0.5s ease",
                  marginTop: 0,
                }}
                onClick={endQuiz}
              >
                <XCircle size={22} color="white" />
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#fff",
                    margin: 0,
                    fontFamily: "Poppins",
                    letterSpacing: 0.8,
                    marginLeft: 10,
                    marginTop: 0,
                  }}
                >
                  End Quiz
                </p>
              </button>
            )}

            <Trash2
              size={20}
              color="#6C63FF"
              style={{ margin: "auto 20px auto 0", cursor: "pointer" }}
              onClick={deleteQuiz}
            />

            <Edit3
              size={21}
              color="#6C63FF"
              style={{ margin: "auto 20px auto 0", cursor: "pointer" }}
              onClick={openModalRename}
            />
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div
            style={{
              width: "100%",
              marginTop: 20,
              borderTop: "3px solid",
              paddingLeft: 25,
              paddingTop: 30,
              paddingBottom: 50,
            }}
            className="borderrad"
          >
            {isActive ? (
              !hasSubmitted ? (
                <RenderQuizForStudent />
              ) : (
                <EmptyStateSmall
                  title="Response submitted"
                  d1="If you think this is a mistake, please contact your teacher"
                />
              )
            ) : (
              <EmptyStateSmall
                title="Quiz has not started yet"
                d1="If you think this is a mistake, please contact your teacher"
              />
            )}
          </div>
          {isActive && !hasSubmitted ? (
            <div
              style={{
                position: "fixed",
                top: 90,
                right: 25,
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
              }}
            >
              <button style={{ paddingLeft: 15 }} onClick={submitQuiz}>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "#fff",
                    margin: 0,
                    fontFamily: "Poppins",
                    letterSpacing: 0.8,
                    marginLeft: 5,
                  }}
                >
                  Submit
                </p>
              </button>
            </div>
          ) : null}
        </React.Fragment>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Modal"
        closeTimeoutMS={200}
        className="background"
      >
        <X
          size={25}
          color="#ababab"
          style={{
            position: "absolute",
            top: 25,
            right: 25,
            cursor: "pointer",
          }}
          onClick={closeModal}
        />

        <h2
          className="changeColor"
          style={{
            textAlign: "left",
            fontFamily: "Poppins",
            color: "#232323",
            fontWeight: 600,
            fontSize: 20,
            padding: 0,
            marginBottom: 0,
          }}
        >
          Are you sure you want to submit the quiz?
        </h2>

        <h2
          className="sub"
          style={{
            textAlign: "left",
            fontFamily: "Poppins",
            color: "#232323",
            fontWeight: 600,
            fontSize: 16,
            padding: 0,
            marginBottom: 0,
            marginTop: 35,
          }}
        >
          You attempted {quizResponse ? quizResponse.questions_attempted : null}{" "}
          out of {quizResponse ? quizResponse.no_of_questions : null} questions
        </h2>

        <ul style={{ margin: 0, padding: 0, marginLeft: 0, marginTop: 20 }}>
          <li>
            <p
              className="sub"
              style={{
                fontFamily: "Poppins",
                fontSize: 14,
                color: "#545454",
                fontWeight: 500,
                margin: 0,
                padding: 0,
                textAlign: "left",
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              Once the quiz is submitted, you cannot attempt it again
            </p>
          </li>
          <li>
            <p
              className="sub"
              style={{
                fontFamily: "Poppins",
                fontSize: 14,
                color: "#545454",
                fontWeight: 500,
                margin: 0,
                padding: 0,
                textAlign: "left",
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              You will be able to view your score immediately after submitting
            </p>
          </li>
        </ul>

        <div
          style={{
            position: "absolute",
            bottom: 25,
            right: 25,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              postQuizSubmission();
              closeModal();
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                margin: 0,
                fontFamily: "Poppins",
                letterSpacing: 0.8,
              }}
            >
              Submit
            </p>
          </button>
          <button
            style={{ backgroundColor: "transparent", boxShadow: "none" }}
            onClick={closeModal}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#6C63FF",
                margin: 0,
                fontFamily: "Poppins",
                letterSpacing: 0.8,
              }}
            >
              Cancel
            </p>
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpenResult}
        onRequestClose={closeModalResult}
        style={customStyles}
        contentLabel="Modal"
        closeTimeoutMS={200}
        className="background"
      >
        <h2
          className="sub"
          style={{
            textAlign: "center",
            fontFamily: "Poppins",
            color: "#232323",
            fontWeight: 600,
            fontSize: 17,
            padding: 0,
            marginBottom: 0,
            marginTop: 15,
            letterSpacing: 0.5,
          }}
        >
          QUIZ RESULT
        </h2>

        <GaugeChart
          id="gauge-chart3"
          nrOfLevels={5}
          colors={[
            "#6C63FF2a",
            "#6C63FF5a",
            "#6C63FF8a",
            "#6C63FFbf",
            "#6C63FF",
          ]}
          arcWidth={0.3}
          hideText
          className="grey"
          style={{
            width: 350,
            alignSelf: "center",
            margin: "20px auto",
            marginBottom: 10,
          }}
          percent={
            quizResponse
              ? (
                  quizResponse.marks_obtained / quizResponse.total_marks
                ).toFixed(2)
              : 0.5
          }
        />

        <h2
          className="changeColor"
          style={{
            textAlign: "center",
            fontFamily: "Poppins",
            color: "#232323",
            fontWeight: 600,
            fontSize: 19,
            padding: 0,
            marginBottom: 0,
            marginTop: 0,
          }}
        >
          You obtained {quizResponse ? quizResponse.marks_obtained : null} out
          of {quizResponse ? quizResponse.total_marks : null} marks in{" "}
          {quizInfo ? quizInfo.quiz_title : null}
        </h2>

        <div
          style={{
            position: "absolute",
            bottom: 25,
            right: 25,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
          }}
        >
          <Link to={`/course/${quizInfo ? quizInfo.course_id : ""}`}>
            <button
              onClick={() => {
                closeModalResult();
              }}
            >
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#fff",
                  margin: 0,
                  fontFamily: "Poppins",
                  letterSpacing: 0.8,
                }}
              >
                Okay
              </p>
            </button>
          </Link>
        </div>
      </Modal>

      <Modal
        isOpen={modalIsOpenRename}
        onRequestClose={closeModalRename}
        style={customStyles}
        contentLabel="Modal"
        closeTimeoutMS={200}
        className="background"
      >
        <X
          size={25}
          color="#ababab"
          style={{
            position: "absolute",
            top: 25,
            right: 25,
            cursor: "pointer",
          }}
          onClick={closeModalRename}
        />

        <h2
          className="changeColor"
          style={{
            textAlign: "left",
            fontFamily: "Poppins",
            color: "#232323",
            fontWeight: 600,
            fontSize: 20,
            padding: 0,
            marginBottom: 0,
          }}
        >
          Change name of quiz
        </h2>

        <input
          placeholder="Enter new name for quiz"
          value={quizNewName}
          onChange={(t) => setQuizNewName(t.target.value)}
          style={{ marginTop: 60 }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 25,
            right: 25,
            display: "flex",
            flexDirection: "row-reverse",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => {
              renameQuiz();
              closeModalRename();
            }}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                margin: 0,
                fontFamily: "Poppins",
                letterSpacing: 0.8,
              }}
            >
              Save
            </p>
          </button>
          <button
            style={{ backgroundColor: "transparent", boxShadow: "none" }}
            onClick={closeModalRename}
          >
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#6C63FF",
                margin: 0,
                fontFamily: "Poppins",
                letterSpacing: 0.8,
              }}
            >
              Cancel
            </p>
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Quiz;

const styles = {
  tabs: {},

  slide: {
    padding: 15,
    minHeight: 100,
    flexGrow: 1,
    color: "#232323",
  },
};

const LineChart = ({ quizResults }) => {
  let labelsArr = [];
  quizResults.map((q) => labelsArr.push(""));

  return (
    <Line
      width="100%"
      height="43%"
      //ref={chartRefLine}
      data={{
        labels: labelsArr,
        datasets: [
          {
            label: "Stock Price",
            backgroundColor: ["#0AA0131a"],
            data: quizResults.map((q) => q.marks_obtained),
            borderColor: "#0AA013",
            borderWidth: 3,
            hoverBorderWidth: 5,
            hoverRadius: 5,
            hoverBackgroundColor: "#0AA013",
            showLine: true,
            hitRadius: 30,
          },
        ],
      }}
      options={{
        layout: {
          padding: {
            bottom: 30,
          },
        },
        plugins: [
          {
            afterDraw: (chart) => {
              var ctx = chart.chart.ctx;
              var xAxis = chart.scales["x-axis-0"];
              var yAxis = chart.scales["y-axis-0"];
              xAxis.ticks.forEach((value, index) => {
                var x = xAxis.getPixelForTick(index);
                var image = (new Image().src = userImage);
                // image.src = userImage,
                ctx.drawImage(image, x - 12, yAxis.bottom + 10);
              });
            },
          },
        ],
        showLines: true,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                stepSize: 20,
                beginAtZero: true,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: "#eeeeee",
                lineWidth: 0.5,
              },
              ticks: {
                stepSize: 10,
                beginAtZero: true,
                max: quizResults.length ? quizResults[0].total_marks + 2 : 0,
              },
            },
          ],
        },
        tooltips: {
          mode: "index",
          backgroundColor: "white",
          borderWidth: 0.5,
          borderColor: "#d3d3d3",
          cornerRadius: 8,
          caretSize: 10,
          xPadding: 12,
          yPadding: 12,
          titleFontColor: "#434343",
          titleFontSize: 0,
          titleFontFamily: "Poppins",
          bodyFontFamily: "Poppins",
          bodyAlign: "center",
          bodyFontSize: 13,
          bodyFontColor: "#434343",
          caretPadding: 20,
          displayColors: false,
          callbacks: {
            label: function (tooltipItem, data) {
              var label =
                data.datasets[tooltipItem.datasetIndex].data[
                  tooltipItem.index
                ] || "";
              return `${label} marks`;
            },
            labelTextColor: function (tooltipItem, chart) {
              return "#543453";
            },
            labelColor: function (tooltipItem, chart) {
              return {
                borderColor: "#000000000",
                backgroundColor: "#00000000",
              };
            },
          },
        },
      }}
    />
  );
};

const BarChartCustom = ({ quizResults }) => {
  let labelsArr = [];
  quizResults.map((q) => labelsArr.push(q.student_name));
  return (
    <Bar
      width="100%"
      height="43%"
      data={{
        labels: labelsArr,
        datasets: [
          {
            label: "Stock Price",
            backgroundColor: "#0AA0132a",
            data: quizResults.map((q) => q.marks_obtained),
            borderColor: "#0AA013",
            borderWidth: 3,
            cornerRadius: 10,
            hoverBorderWidth: 3,
            hoverRadius: 5,
            hoverBackgroundColor: "#0AA0134a",
            showLine: true,
            hitRadius: 30,
            radius: 10,
          },
        ],
      }}
      options={{
        showLines: true,
        legend: {
          display: false,
        },
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                stepSize: 10,
                beginAtZero: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: true,
                color: "#eeeeee",
                lineWidth: 0.5,
              },
              ticks: {
                stepSize: 10,
                beginAtZero: true,
                max: quizResults.length ? quizResults[0].total_marks + 2 : 0,
              },
            },
          ],
        },
        tooltips: {
          mode: "index",
          backgroundColor: "white",
          borderWidth: 0.5,
          borderColor: "#d3d3d3",
          cornerRadius: 8,
          caretSize: 10,
          xPadding: 12,
          yPadding: 12,
          titleFontColor: "#434343",
          titleFontSize: 0,
          titleFontFamily: "Poppins",
          bodyFontFamily: "Poppins",
          bodyAlign: "center",
          bodyFontSize: 13,
          bodyFontColor: "#434343",
          caretPadding: 20,
          displayColors: false,
          callbacks: {
            label: function (tooltipItem, data) {
              var label =
                data.datasets[tooltipItem.datasetIndex].data[
                  tooltipItem.index
                ] || "";
              return `${label} marks`;
            },
            labelTextColor: function (tooltipItem, chart) {
              return "#543453";
            },
            labelColor: function (tooltipItem, chart) {
              return {
                borderColor: "#000000000",
                backgroundColor: "#00000000",
              };
            },
          },
        },
      }}
    />
  );
};
