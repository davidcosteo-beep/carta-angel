function Agenda() {

  return (

    <div className="page-transition">

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "30px 20px"
        }}
      >

        <h1>Agenda</h1>

        <button>
          ➕ Nueva Cita
        </button>

        <p
          style={{
            marginTop: "25px"
          }}
        >
          No hay citas programadas.
        </p>

      </div>

    </div>

  );

}

export default Agenda;