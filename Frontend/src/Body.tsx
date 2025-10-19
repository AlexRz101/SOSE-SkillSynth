import { categories } from "./components/cardData";
import Card from "./components/card";

function Body() {
  return (
    <main className="w-full flex justify-center px-6 pb-24">
      <div className="w-full max-w-6xl">
        {categories.map((cat) => (
          <section key={cat.key} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-wider">
                {cat.title}
              </h2>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cat.cards.map((card) => (
                <Card
                  key={card.id}
                  skill={card.skill}
                  description={card.description}
                  image={card.image}
                  onClick={() => console.log(`${card.skill} clicked`)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default Body;
