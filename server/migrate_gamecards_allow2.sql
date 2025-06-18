-- Migration script to update GameCards table to allow won = -1, 0, 1, 2
CREATE TABLE GameCards_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    card_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    won INTEGER NOT NULL CHECK(won IN (-1, 0, 1, 2)),
    FOREIGN KEY(game_id) REFERENCES Games(id),
    FOREIGN KEY(card_id) REFERENCES Cards(id)
);

INSERT INTO GameCards_new (id, game_id, card_id, round_number, won)
SELECT id, game_id, card_id, round_number, won FROM GameCards;

DROP TABLE GameCards;
ALTER TABLE GameCards_new RENAME TO GameCards;
