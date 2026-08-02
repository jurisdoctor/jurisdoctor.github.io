import { Prefixes, Household, MetricToHousehold } from "./Data";

const card =
  "rounded-xl bg-[var(--container-color)] p-7 shadow-xl animate-fadeIn";

// side by side down to 576px — the columns get tight well before that, so the
// type and gaps step down rather than the row breaking apart
const rowClass =
  "grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 border-b border-solid border-[#f1f1f1] py-2 last:border-none lg:gap-x-2 lg:text-sm md:gap-x-1 md:text-xs sm:grid-cols-1 sm:gap-y-1 sm:text-center sm:text-base";

/** the two tables shed padding as their columns narrow */
const tableCard =
  "rounded-xl bg-[var(--container-color)] shadow-xl animate-fadeIn p-7 md:p-4 sm:p-7";

const Conversions = () => {
  return (
    <section className="mb-16" id="conversions">
      <h2 className="relative mb-8 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
        Conversions
      </h2>

      <h3 className="mb-4 ml-3.5 text-xl lg:ml-0 lg:text-center">
        Metric System Prefixes
      </h3>

      <div className="mb-4 grid grid-cols-3 items-start gap-7 lg:grid-cols-2 md:grid-cols-1">
        {Prefixes.map((prefix) => (
          <div key={prefix.name} className={card}>
            <h3 className="text-xl">{prefix.name}</h3>
            <span className="text-sm text-[#8b88b1]">{prefix.meaning}</span>

            <div className="mt-3 grid gap-y-1">
              {prefix.lines.map((line) => (
                <p key={line} className="text-sm">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-14 ml-3.5 text-xs italic text-[#8b88b1] lg:ml-0 lg:text-center">
        *Use abbreviation &quot;mcg&quot; for medical documentation.
      </p>

      <div className="grid grid-cols-2 items-start gap-x-7 md:gap-x-4 sm:grid-cols-1 sm:gap-y-10">
        <div>
          <h3 className="mb-4 ml-3.5 text-xl lg:ml-0 lg:text-center">
            Household System Conversions
          </h3>

          <div className={tableCard}>
            <div className="grid gap-y-1">
              {Household.map((row) => (
                <div key={row.left} className={rowClass}>
                  <span className="text-right sm:text-center">{row.left}</span>
                  <span className="font-bold text-[var(--primary-color)]">
                    =
                  </span>
                  <span>{row.right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 ml-3.5 text-xl lg:ml-0 lg:text-center">
            Conversions Between Metric &amp; Household Units
          </h3>

          <div className={tableCard}>
            <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 sm:hidden">
              <span className="text-right text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                Metric System
              </span>
              <span className="w-4" />
              <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
                Household System
              </span>
            </div>

            <div className="grid gap-y-1">
              {MetricToHousehold.map((row) => (
                <div key={row.left} className={rowClass}>
                  <span className="text-right sm:text-center">{row.left}</span>
                  <span className="font-bold text-[var(--primary-color)]">
                    =
                  </span>
                  <span>{row.right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Conversions;
