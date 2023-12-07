import { LuContact2 } from "react-icons/lu";
import { CiLocationArrow1 } from "react-icons/ci";

const Contact = () => {
  return (
    <section className="contact pt-24 pb-8" id="contact">
      <h2 className="text-4xl text-[var(--title-color)] text-center">
        Get in touch
      </h2>
      <span className="block text-sm text-center mb-16">Contact Me</span>

      <div className="grid-cols-2 justify-center gap-x-24 pb-12 max-w-[768px] mx-auto grid">
        <div className="contact__content">
          <h3 className="text-center text-xl font-medium mb-6">Talk to me</h3>

          <div className="grid gap-y-1 col-grids-[300px]">
            <div className="bg-[var(--container-color)] border-[1px] border-solid border-[rgba(0,0,0,0.1)] p-4 rounded-xl text-center">
              <LuContact2 className="m-auto text-3xl text-[var(--title-color)] mb-1" />
              <h3 className="text-xs font-medium">Email</h3>
              <span className="text-xs block mb-3">tomtldr@gmail.com</span>

              <a
                href="mainto:tomtldr@gmail.com"
                className="text-[var(--text-color)] text-xs inline-flex items-center justify-center gap-x-1"
              >
                Write me{" "}
                <CiLocationArrow1 className="text-base duration-300 hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>

        <div className="contact__content">
          <h3 className="text-center text-xl font-medium mb-6">
            Write me your project
          </h3>

          <form className="w-[360px]">
            <div className="relative mb-8 h-16">
              <label className="absolute top-[-0.75rem] left-5 text-xs p-1 bg-[var(--body-color)] z-20">
                Name
              </label>
              <input
                type="text"
                name="name"
                className="absolute top-0 left-0 w-full h-full border-[2px] border-solid border-[rgba(0,0,0,0.3)] bg-transparent text-[var(--text-color)] outline-transparent rounded-xl p-6 z-10"
                placeholder="Type name"
              />
            </div>

            <div className="relative mb-8 h-16">
              <label className="absolute top-[-0.75rem] left-5 text-xs p-1 bg-[var(--body-color)] z-20">
                Email
              </label>
              <input
                type="email"
                name="email"
                className="absolute top-0 left-0 w-full h-full border-[2px] border-solid border-[rgba(0,0,0,0.3)] bg-transparent text-[var(--text-color)] outline-transparent rounded-xl p-6 z-10"
                placeholder="Type email"
              />
            </div>

            <div className="relative mb-8 h-16">
              <label className="absolute top-[-0.75rem] left-5 text-xs p-1 bg-[var(--body-color)] z-20">
                Message
              </label>
              <textarea
                name="message"
                cols={30}
                rows={10}
                className="absolute top-0 left-0 w-full border-[2px] border-solid border-[rgba(0,0,0,0.3)] bg-transparent text-[var(--text-color)] outline-transparent rounded-xl p-6 z-10 resize-none h-[11rem]"
                placeholder="Start here"
              ></textarea>
            </div>

            <button className="inline-flex bg-[var(--title-color)] text-[var(--container-color)] py-5 px-8 rounded-2xl font-medium button--flex items-center">
              Send Message 📨
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
