const Contact = () => {
  return (
    <section
      className="contact m-auto max-w-[1080px] px-[15px] pb-24 pt-28"
      id="contact"
    >
      <h2 className="relative mb-14 ml-3.5 text-4xl font-bold">Say 👋🏼!</h2>

      <div className="xs:grid-cols-1 grid grid-cols-[4fr_8fr] gap-x-[1.875rem] md:grid-cols-[310px] md:gap-y-[1.875rem] lg:grid-cols-[300px_360px] lg:justify-center">
        <div className="md:text-center">
          <h3 className="mb-2 text-xl">I am an open book</h3>
          <p className="contact__details">Hit me up anytime!</p>
        </div>

        <form action="" className="contact__form">
          <div className="grid grid-cols-2 gap-x-6 lg:grid-cols-1">
            <div className="relative mb-[1.875rem] h-14">
              <input
                type="text"
                className="absolute left-0 top-0 z-10 h-full w-full rounded-2xl border-none bg-[var(--container-color)] px-[1.875rem] py-[0.625rem] text-[var(--text-color)] shadow-xl outline-none"
                placeholder="Name"
              />
            </div>

            <div className="relative mb-[1.875rem] h-14">
              <input
                type="email"
                className="absolute left-0 top-0 z-10 h-full w-full rounded-2xl border-none bg-[var(--container-color)] px-[1.875rem] py-[0.625rem] text-[var(--text-color)] shadow-xl outline-none"
                placeholder="Email"
              />
            </div>
          </div>

          <div className="relative mb-[1.875rem] h-14">
            <input
              type="text"
              className="absolute left-0 top-0 z-10 h-full w-full rounded-2xl border-none bg-[var(--container-color)] px-[1.875rem] py-[0.625rem] text-[var(--text-color)] shadow-xl outline-none"
              placeholder="Subject"
            />
          </div>

          <div className="= relative mb-[1.875rem] h-40">
            <textarea
              name=""
              id=""
              cols={30}
              rows={10}
              className="absolute left-0 top-0 z-10 h-full w-full resize-none rounded-2xl border-none bg-[var(--container-color)] px-[1.875rem] py-[0.625rem] text-[var(--text-color)] shadow-xl outline-none"
              placeholder="Message"
            ></textarea>
          </div>

          <button className="mb-1 inline-block rounded-[1.875rem] border-[1px] border-solid border-transparent bg-[var(--primary-color)] px-8 py-3 font-bold leading-4 text-white shadow-lg hover:animate-pulse">
            Send 📬
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
