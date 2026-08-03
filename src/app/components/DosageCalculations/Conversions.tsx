import { Fragment } from "react";
import {
  Prefixes,
  Household,
  MetricConversions,
  MetricToHousehold,
  RowType,
} from "./Data";
const card =
  "rounded-xl bg-[var(--container-color)] p-7 lg:p-5 sm:p-7 shadow-xl animate-fadeIn";
const rowClass =
  "grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 border-b border-solid border-[#f1f1f1] py-2 last:border-none lg:gap-x-2 lg:text-sm md:gap-x-1 md:text-xs sm:grid-cols-1 sm:gap-y-1 sm:text-center sm:text-base";
const tableCard =
  "rounded-xl bg-[var(--container-color)] shadow-xl animate-fadeIn p-7 md:p-4 sm:p-7";
const Table = ({
  title,
  rows,
  headers,
}: {
  title: string;
  rows: RowType[];
  headers?: [string, string];
}) => (
  <div>
    <h3 className="mb-4 ml-3.5 text-xl lg:ml-0 lg:text-center">{title}</h3>

    <div className={tableCard}>
      {headers && (
        <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-x-4 sm:hidden">
          <span className="text-right text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
            {headers[0]}
          </span>
          <span className="w-4" />
          <span className="text-xs font-bold uppercase tracking-wide text-[#8b88b1]">
            {headers[1]}
          </span>
        </div>
      )}

      <div className="grid gap-y-1">
        {rows.map((row) => (
          <div key={row.left} className={rowClass}>
            <span className="text-right sm:text-center">{row.left}</span>
            <span className="font-bold text-[var(--primary-color)]">=</span>
            <span>{row.right}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
const Conversions = () => {
  return (
    <section className="mb-16" id="conversions">
      <h2 className="relative mb-8 ml-3.5 text-3xl font-bold lg:ml-0 lg:text-center">
        Conversions
      </h2>

      <h3 className="mb-4 ml-3.5 text-xl lg:ml-0 lg:text-center">
        Metric System Prefixes
      </h3>

      <div className="mb-4 grid grid-cols-2 items-start gap-7 md:gap-4 sm:grid-cols-1">
        {Prefixes.map((prefix) => (
          <div key={prefix.name} className={card}>
            <h3 className="text-xl">{prefix.name}</h3>
            <span className="text-sm text-[#8b88b1]">{prefix.meaning}</span>

            <div className="mx-auto mt-3 grid w-fit grid-cols-[auto_auto_auto] items-center gap-x-2 gap-y-2 text-sm lg:gap-x-1.5 lg:text-xs sm:gap-x-2 sm:text-sm">
              {prefix.lines.map((line) => (
                <Fragment key={line.right + (line.bottom ?? line.left ?? "")}>
                  {line.bottom ? (
                    <span className="flex items-center gap-x-2 justify-self-end">
                      <span className="inline-flex flex-col text-center leading-tight">
                        <span className="px-1">{line.top}</span>
                        <span className="border-t border-solid border-[var(--text-color)] px-1">
                          {line.bottom}
                        </span>
                      </span>
                      <span>{line.unit}</span>
                      <em className="text-[#8b88b1]">or</em>
                      <span className="whitespace-nowrap">
                        {line.decimal} {line.unit}
                      </span>
                    </span>
                  ) : (
                    <span className="justify-self-end whitespace-nowrap">
                      {line.left}
                    </span>
                  )}

                  <span className="font-bold text-[var(--primary-color)]">
                    =
                  </span>
                  <span>{line.right}</span>
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mb-14 ml-3.5 text-xs italic text-[#8b88b1] lg:ml-0 lg:text-center">
        *Use abbreviation &quot;mcg&quot; for medical documentation.
      </p>

      <div className="grid grid-cols-2 items-start gap-x-7 gap-y-10 md:gap-x-4 sm:grid-cols-1">
        <Table title="Metric System Conversions" rows={MetricConversions} />
        <Table title="Household System Conversions" rows={Household} />
        <Table
          title="Conversions Between Metric & Household Units"
          rows={MetricToHousehold}
          headers={["Metric System", "Household System"]}
        />
      </div>
    </section>
  );
};
export default Conversions;
