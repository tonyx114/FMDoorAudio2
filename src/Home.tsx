import "./App.css";
import { useEffect, useState } from "react";
import logo from './assets/logo2.png'

interface Door {
    DoorName: string;
    SoundName: string;
    SoundSet: string;
    Params: string;
    Value: number;
}

interface DoorSound {
    name: string;
    soundSet: string;
    Params: string;
    value: number;
}

interface DoorConfig {
    availableDoorSound: DoorSound[];
}

function Home() {
    const [doors, setDoors] = useState<Door[]>([]);
    const [doorSounds, setDoorSounds] = useState<DoorSound[]>([]);

    const [showAddDoor, setShowAddDoor] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const [DoorName, setDoorName] = useState("");
    const [selectedSoundSet, setSelectedSoundSet] = useState("");
    const [search, setSearch] = useState("");
    const [fullscreen, setFullscreen] = useState(false);

    useEffect(() => {
        loadDoorSounds();
    }, []);

    async function loadDoorSounds() {
        const config: DoorConfig = await window.electron.loadDoorConfig();

        const sounds = config?.availableDoorSound ?? [];
        setDoorSounds(sounds);

        if (sounds.length > 0) {
            setSelectedSoundSet(sounds[0].soundSet);
        }
    }

    function openAddDoor() {
        setEditingIndex(null);
        setDoorName("");

        if (doorSounds.length > 0) {
            setSelectedSoundSet(doorSounds[0].soundSet);
        }

        setShowAddDoor(true);
    }

    function openEditDoor(index: number) {
        const door = filteredDoors[index];

        setEditingIndex(index);
        setDoorName(door.DoorName);
        setSelectedSoundSet(door.SoundSet);
        setShowAddDoor(true);
    }

    function closeModal() {
        setShowAddDoor(false);
        setEditingIndex(null);
        setDoorName("");
    }

    function saveDoor() {
        if (!DoorName.trim()) return;

        const sound = doorSounds.find(
            s => s.soundSet === selectedSoundSet
        );

        if (!sound) return;

        const newDoor: Door = {
            DoorName: DoorName.trim(),
            SoundName: sound.name,
            SoundSet: sound.soundSet,
            Params: sound.Params,
            Value: sound.value
        };

        if (editingIndex === null) {
            setDoors(prev => [...prev, newDoor]);
        } else {
            setDoors(prev => {
                const copy = [...prev];
                copy[editingIndex] = newDoor;
                return copy;
            });
        }

        closeModal();
    }

    function deleteDoor() {
        if (editingIndex === null) return;

        setDoors(prev => prev.filter((_, i) => i !== editingIndex));
        closeModal();
    }

    async function saveProject() {
        await window.electron.saveProject(doors);
    }

    async function openProject() {
        const data = await window.electron.openProject();
        if (data) setDoors(data);
    }

    async function exportXml() {
        await window.electron.exportXml(doors);
    }

    function toggleFullscreen() {
        const state = !fullscreen;
        setFullscreen(state);
        window.electron.toggleFullscreen(state);
    }

    const filteredDoors = doors.filter(d =>
        d.DoorName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="bar">
                <img className="Logo" src={logo} alt="Logo" />

                <div className="bar-buttonstool">
                  <button className="project" onClick={openProject}><i className="ri-download-2-fill"></i>Open Project</button>
                  <button className="project" onClick={saveProject}><i className="ri-upload-2-fill"></i>Save Project</button>
                </div>

                <div className="bar-buttons">
                    <button className="AddDoor" onClick={openAddDoor}>
                      <i className="ri-add-large-line"></i>
                        Add Door
                    </button>

                    <button onClick={() => window.electron.opencofe()}>☕ Support me</button>

                    <button onClick={toggleFullscreen}>
                        <i className="ri-fullscreen-fill"></i>
                    </button>

                    <button onClick={() => window.electron.exit()}>
                        <i className="ri-close-large-line"></i>
                    </button>
                </div>
            </div>
            <div className="home">
              <div className="panel">
                <div className="panel-buttons">
                    <h3 className="text">Doors: {doors.length}</h3>
                    <div className="search">
                      <i className="ri-search-line"></i>
                      <input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                </div>
                <div className="table-container">
                  <table>
                      <thead>
                          <tr>
                              <th>Name</th>
                              <th>Sound</th>
                              <th>Params</th>
                              <th>Value</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredDoors.length === 0 ? (
                              <tr>
                                  <td colSpan={4}>No doors</td>
                              </tr>
                          ) : (
                              filteredDoors.map((door, i) => (
                                  <tr
                                      key={i}
                                      onDoubleClick={() => openEditDoor(i)}
                                  >
                                      <td>{door.DoorName}</td>
                                      <td>{door.SoundName}</td>
                                      <td>{door.Params}</td>
                                      <td>{door.Value}</td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
                </div>
                <button onClick={exportXml}>Export</button>
              </div>
            </div>
            {showAddDoor && (
                <div className="modal" onClick={closeModal}>
                    <div
                        className="modalWindow"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>
                            {editingIndex === null ? "Add Door" : "Edit Door"}
                        </h2>

                        <input
                            value={DoorName}
                            onChange={(e) => setDoorName(e.target.value)}
                            placeholder="Door name"
                        />

                        <select
                            value={selectedSoundSet}
                            onChange={(e) => setSelectedSoundSet(e.target.value)}
                        >
                            {doorSounds.map(s => (
                                <option
                                    key={s.soundSet}
                                    value={s.soundSet}
                                >
                                    {s.name}
                                </option>
                            ))}
                        </select>

                        <div className="modalButtons">
                            <button onClick={closeModal}>
                                Cancel
                            </button>

                            {editingIndex !== null && (
                                <button onClick={deleteDoor}>
                                    Delete
                                </button>
                            )}

                            <button className="save" onClick={saveDoor}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;