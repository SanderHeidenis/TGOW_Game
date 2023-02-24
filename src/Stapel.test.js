import {Stapel} from "./Stapel.js";
import {test, expect} from "vitest";

test('DuwString', () => {
    const testStapel = new Stapel();
    testStapel.duw("hoi");
    expect(testStapel.laatsteItem.data).equals("hoi");
});

test('DuwInt', () => {
    const testStapel = new Stapel();
    testStapel.duw(3);
    expect(testStapel.laatsteItem.data).equals(3);
});

test('DuwVerschillendeTypes', () => {
    const testStapel = new Stapel();
    testStapel.duw("hoi");
    testStapel.duw(3);
    expect(testStapel.pak()).equals(3);
    expect(testStapel.pak()).equals("hoi");
})

test('Pak', () => {
    const testStapel = new Stapel();
    testStapel.duw("hoi");
    expect(testStapel.pak()).equals("hoi");
});

test('PakLeeg', () => {
     const testStapel = new Stapel();
     expect(testStapel.pak()).equals(null);
})

test('PakVolgorde', () => {
    const testStapel = new Stapel();
    testStapel.duw("Alice");
    testStapel.duw("Bob");
    expect(testStapel.pak()).equals("Bob");
    testStapel.duw("Eve");
    expect(testStapel.pak()).equals("Eve");
    expect(testStapel.pak()).equals("Alice");
})

test('ReferentieTest', () => {
    const testStapel = new Stapel();
    let testString = "hallo"
    testStapel.duw(testString)
    let newString = testString
    newString += "2"
    testString = newString
    testStapel.duw(testString)
    expect(testStapel.pak()).equals("hallo2");
    expect(testStapel.pak()).equals("hallo");
})
