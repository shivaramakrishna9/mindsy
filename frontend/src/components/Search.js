import React from "react";
import Axios from "axios";
import { toast } from "react-toastify";
import { Search, Mail } from "react-feather";
import { getRandomUser } from "./random";
import "./css/CreateCourse.css";
import "./css/Course.css";

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

const SearchPage = ({}) => {
  const [courseStudents, setCourseStudents] = React.useState([]);
  const [course, setCourse] = React.useState(null);
  const [fName, setfName] = React.useState("");
  const [lName, setlName] = React.useState("");
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    Axios.get(`/api/fetchCourse/teacher/${user._id}`)
      .then((res) => {
        if (res.data.success) {
          let courses = res.data.data;
          setCourse(courses);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [courseStudents]);

  const Mailto = ({ email, subject, body, children }) => {
    return (
      <a
        href={`mailto:${email}?subject=${
          encodeURIComponent(subject) || ""
        }&body=${encodeURIComponent(body) || ""}`}
        target="_blank"
      >
        {children}
      </a>
    );
  };

  const search = () => {
    if (!fName.length && !lName.length) {
      toast.error("Please specify name");
      return;
    }
    setCourseStudents([]);
    let arr = [];
    course.map((course, index) => {
      Axios.post(`/api/search/${course._id}`, { fName, lName })
        .then((res) => {
          if (res.data.success) {
            res.data.data.forEach((t) => arr.push(t));
          } else {
            toast.error("Unable to fetch student data");
          }
          setCourseStudents(arr);
          setIsReady(true);
        })
        .catch((error) => {
          console.log(error);
        });
    });
  };

  const MarksRow = (stud) => {
    let { student } = stud;
    const body = `Hi ${student.fName}! This is ${user.fName}, your instructor.`;
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
          marginRight: 0,
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
            {student.fName.concat(" ").concat(student.lName)}
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
              width: 100,
            }}
            className="changeColor"
          >
            {student.year}
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
              width: 100,
            }}
            className="changeColor"
          >
            {student.department}
          </p>
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
              width: 250,
            }}
            className="changeColor"
          >
            {student.email}
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
              width: 100,
            }}
            className="changeColor"
          >
            <Mailto
              email={student.email}
              subject={"Reaching out regarding ..."}
              body={body}
            >
              <Mail size={22} className="sub" />
            </Mailto>
          </p>
        </div>
      </div>
    );
  };

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
          marginRight: 0,
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
              width: 100,
            }}
            className="changeColor"
          >
            CLASS
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
              width: 100,
            }}
            className="changeColor"
          >
            DEPT
          </p>
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
              width: 250,
            }}
            className="changeColor"
          >
            EMAIL
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
              width: 100,
            }}
            className="changeColor"
          ></p>
        </div>
      </div>
    );
  };

  return (
    <div
      className={"background course-container"}
      style={{ height: window.innerHeight + 60 }}
    >
      <div style={{ height: window.innerHeight + 60, width: "100%" }}>
        <h2
          className="course-title"
          style={{ fontSize: 30, marginTop: 20, marginBottom: 60 }}
        >
          Search Student Info
        </h2>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flexGrow: 1,
              justifyContent: "space-between",
            }}
          >
            <input
              type="text"
              style={{ height: 60, fontSize: 25, width: "48%" }}
              autoFocus
              maxLength={40}
              placeholder="First Name"
              value={fName}
              onChange={(t) => setfName(t.target.value)}
            ></input>
            <input
              type="text"
              style={{ height: 60, fontSize: 25, width: "48%" }}
              maxLength={40}
              placeholder="Last Name"
              value={lName}
              onChange={(t) => setlName(t.target.value)}
            ></input>
          </div>
          <button
            style={{
              borderRadius: 100,
              height: 60,
              width: 60,
              marginTop: 0,
              marginBottom: 10,
              padding: 0,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={search}
          >
            <Search size={30} color="#fff" />
          </button>
        </div>

        <p
          className="sub"
          style={{
            fontSize: 16,
            fontFamily: "Poppins",
            fontWeight: 500,
            margin: 0,
            padding: 0,
            marginTop: 30,
            marginBottom: 25,
          }}
        >
          SHOWING SEARCH RESULTS
        </p>
        <MarksRowHeading />
        {courseStudents.length && isReady ? (
          courseStudents.map((op, index) => {
            return <MarksRow student={op} />;
          })
        ) : (
          <p
            className="sub"
            style={{
              fontSize: 16,
              fontFamily: "Poppins",
              fontWeight: 500,
              margin: "20 auto",
              padding: 0,
              marginTop: 30,
              marginBottom: 25,
              alignSelf: "center",
              textAlign: "center",
            }}
          >
            NO RESULTS
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
