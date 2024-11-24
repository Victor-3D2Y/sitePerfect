import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Função do Header
function Header() {
    const instagram = "./instagram.webp"
    const twitter = "./twitter.png"
    return (
        <div className='header'>
            <h1>FaculHub – O Curso Certo Para Você</h1>
            <div>
                <img src={instagram} className="imagens" alt="insta" />
                <img src={twitter} className="imagens" alt="twitter" />
            </div>
        </div>
    );
}

// Função do Perfil
function Perfil({ foto, nome, openLoginModal, onLogout, usuarioLogado }) {
    const [inscricoes, setInscricoes] = useState(0);

    // Função para buscar o número de inscrições
    const fetchInscricoes = async () => {
        try {
            if (usuarioLogado) {
                // Se houver um usuário logado, busca o total de inscrições dele
                const response = await axios.get(`http://localhost:3001/api/inscricoes/${usuarioLogado.id}`);
                setInscricoes(response.data.total);
            } else {
                // Caso contrário, busca o número total de inscrições no sistema
                const response = await axios.get('http://localhost:3001/api/inscricoes/total');
                setInscricoes(response.data.total);
            }
        } catch (error) {
            console.error('Erro ao buscar inscrições:', error);
        }
    };

    useEffect(() => {
        fetchInscricoes(); // Atualiza o número de inscrições ao carregar o componente
    }, [usuarioLogado]); // Refaz a busca ao alterar o estado de login

    return (
        <div className="perfil">
            {usuarioLogado ? (
                <>
                    <button onClick={onLogout}>Sair</button>
                    <img src={foto} id="faculHub" alt="Foto de perfil" />
                    <h1>{nome}</h1>
                    <p>Inscrições: {inscricoes}</p>
                </>
            ) : (
                <>
                    <button onClick={openLoginModal}>Entrar</button>
                    <img src={foto} id="faculHub" alt="Foto de perfil" />
                    <h1>{nome}</h1>
                    <p>Inscrições: {inscricoes}</p>
                </>
            )}
        </div>
    );
}
// Função do LoginModal
function LoginModal({ showModal, closeModal, onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [isInvalid, setIsInvalid] = useState({ email: false, senha: false });

    const handleLogin = async () => {
        setError('');
        setIsInvalid({ email: false, senha: false });

        try {
            const response = await axios.post('http://localhost:3001/api/login', { email, senha });
            if (response.data.success) {
                onLoginSuccess(response.data.user); // Usuário autenticado com sucesso
                closeModal();
            } else {
                setError('Usuário ou senha incorretos');
                // Define ambos os campos como inválidos
                setIsInvalid({ email: true, senha: true });
            }
        } catch (err) {
            console.error('Erro ao fazer login:', err);
            setError('Erro ao fazer login. Tente novamente.');
        }
    };

    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <div>
                    <input
                        type="email"
                        placeholder="E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={isInvalid.email ? 'input-error' : ''}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className={isInvalid.senha ? 'input-error' : ''}
                    />
                </div>
                <div className="modal-buttons">
                    <button className="cancel-btn" onClick={closeModal}>Cancelar</button>
                    <button className="enter-btn" onClick={handleLogin}>Entrar</button>
                </div>
            </div>
        </div>
    );
}
// Função do Postagem
function Postagem({ fotoMain, nomeCurso, instituicao, numInscritos, numComentarios,
    usuarioLogado, openModal, cursoId, onInscricao, inscritoInicial }) {

    const [showComentarioModal, setShowComentarioModal] = useState(false);
    const [comentariosCount, setComentariosCount] = useState(numComentarios); // Contagem de comentários
    const [inscrito, setInscrito] = useState(inscritoInicial);
    const [inscritos, setInscritos] = useState(numInscritos);

    const flechaCheia = "./flecha_cima_cheia.svg";
    const flechaVazia = "./flecha_cima_vazia.svg";

    const [flecha, setFlecha] = useState(inscritoInicial ? flechaCheia : flechaVazia);

    useEffect(() => { setFlecha(inscritoInicial ? flechaCheia : flechaVazia); setInscrito(inscritoInicial) }, [inscritoInicial])


    const handleInscricao = async () => {
        if (!usuarioLogado) {
            openModal();
        } else if (!inscrito) {
            const sendApi = { usuario_id: usuarioLogado.id, curso_id: cursoId };
            try {
                const response = await axios.post('http://localhost:3001/api/inscricao', sendApi);
                if (response.data.success) {
                    setInscrito(true);
                    setFlecha(flechaCheia);
                    setInscritos(inscritos + 1);
                    onInscricao();
                }
            } catch (error) {
                console.error('Erro ao fazer inscrição:', error);
            }
        } else {
            try {
                const response = await axios.delete(`http://localhost:3001/api/inscricao/${usuarioLogado.id}/${cursoId}`);
                if (response.data.success) {
                    setInscrito(false);
                    setFlecha(flechaVazia);
                    setInscritos(inscritos - 1);
                    onInscricao();
                }
            } catch (error) {
                console.error('Erro ao desinscrever:', error);
            }
        }
    };

    const handleChatClick = () => {
        if (!usuarioLogado) {
            openModal();
        } else {
            setShowComentarioModal(true);
        }
    };

    const closeComentarioModal = () => {
        setShowComentarioModal(false);
    };

    const handleComentarioEnviado = () => {
        setComentariosCount(prev => prev + 1);
    };
    const handleComentarioRemovido = () => {
        setComentariosCount(prev => prev - 1);
    }



    return (
        <>
            <div className="titlePubli">
                <p>{nomeCurso}</p>
                <p>{instituicao}</p>
            </div>
            <img src={fotoMain} id="eletromecanica" alt="eletromecanica" />
            <div className="flechaChat">
                <div className="leftMain">
                    <img src={flecha} alt="flecha" onClick={handleInscricao} />
                    <p>{inscritos} inscritos</p>
                </div>
                <div className="leftMain">
                    <img src="chat.svg" alt="chat" onClick={handleChatClick} />
                    <p>{comentariosCount} comentários</p>
                </div>
            </div>

            {showComentarioModal && (
                <ComentarioModal
                    cursoId={cursoId}
                    usuarioLogado={usuarioLogado}
                    onComentarioEnviado={handleComentarioEnviado}
                    onComentarioDeletado={handleComentarioRemovido}
                    closeModal={closeComentarioModal}
                />
            )}
        </>
    );
}

function ComentarioModal({ cursoId, usuarioLogado, onComentarioEnviado, onComentarioDeletado, closeModal }) {
    const [comentarios, setComentarios] = useState([]);
    const [comentario, setComentario] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const [editingComentarioId, setEditingComentarioId] = useState(null); // ID do comentário em edição
    const [editText, setEditText] = useState(''); // Texto sendo editado
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Controla a exibição do modal de exclusão
    const [comentarioToDelete, setComentarioToDelete] = useState(null); // Comentário a ser deletado

    useEffect(() => {
        const fetchComentarios = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/comentarios/${cursoId}`);
                setComentarios(response.data);
            } catch (error) {
                console.error('Erro ao buscar comentários:', error);
            }
        };
        fetchComentarios();
    }, [cursoId]);

    const handleComentarioChange = (event) => {
        const texto = event.target.value;
        setComentario(texto);
        setIsButtonDisabled(texto.trim() === '');
    };

    const handleComentar = async () => {
        if (comentario.trim()) {
            try {
                const response = await axios.post('http://localhost:3001/api/comentario', {
                    usuario_id: usuarioLogado.id,
                    curso_id: cursoId,
                    texto: comentario
                });
                if (response.data.success) {
                    const novoComentario = response.data.comentario;
                    setComentarios([...comentarios, novoComentario]); // Adiciona o novo comentário à lista
                    onComentarioEnviado(response.data.comentariosCount); // Atualiza a contagem de comentários
                    setComentario(''); // Limpa o campo de texto
                    setIsButtonDisabled(true);
                }
            } catch (error) {
                console.error('Erro ao comentar:', error);
            }
        }
    };

    const handleEditClick = (id, texto) => {
        setEditingComentarioId(id);
        setEditText(texto);
    };

    const handleEditChange = (event) => {
        setEditText(event.target.value);
    };

    const handleEditSave = async () => {
        try {
            const response = await axios.put(`http://localhost:3001/api/comentario/${editingComentarioId}`, {
                texto: editText,
            });
            if (response.data.success) {
                setComentarios((prev) =>
                    prev.map((cmt) =>
                        cmt.id_comentario === editingComentarioId
                            ? { ...cmt, texto: editText }
                            : cmt
                    )
                );
                setEditingComentarioId(null);
                setEditText('');
            }
        } catch (error) {
            console.error('Erro ao editar comentário:', error);
        }
    };

    const handleEditCancel = () => {
        setEditingComentarioId(null);
        setEditText('');
    };

    // Função para exibir o modal de exclusão
    const handleDeleteClick = (id) => {
        setComentarioToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDeleteCancel = () => {
        setComentarioToDelete(null);
        setShowDeleteModal(false);
    };


    const handleDeleteConfirm = async () => {
        try {
            // Enviar a requisição DELETE para excluir o comentário do banco de dados
            const response = await axios.delete(`http://localhost:3001/api/comentario/${comentarioToDelete}`, {
                data: { usuario_id: usuarioLogado.id } // Passando o ID do usuário que está tentando excluir
            });

            if (response.data.success) {
                // Remover o comentário da lista no front-end
                setComentarios(comentarios.filter(cmt => cmt.id_comentario !== comentarioToDelete));
                setComentarioToDelete(null);
                setShowDeleteModal();

                // Subtrai 1 da contagem atual
                onComentarioDeletado()

            } else {
                console.error('Erro ao excluir comentário');
            }
        } catch (error) {
            console.error('Erro ao excluir comentário:', error);
        }
    };



    return (
        <div className="comentario-modal">
            <div className="comentarios-lista">
                {comentarios.map((cmt) => (
                    <div key={cmt.id_comentario} className="comentario-item">
                        {editingComentarioId === cmt.id_comentario ? (
                            <div className="comentario-edicao">
                                <textarea
                                    value={editText}
                                    onChange={handleEditChange}
                                />
                                <div className="botoes-edicao">
                                    <button onClick={handleEditSave} className="botao-atualizar">
                                        Atualizar
                                    </button>
                                    <button onClick={handleEditCancel} className="botao-cancelar">
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="comentario-conteudo">
                                <p className="comentario-texto">
                                    <strong>{cmt.usuario?.nome || 'Anônimo'}:</strong> {cmt.texto}
                                </p>
                                {usuarioLogado?.id === cmt.usuario_id && editingComentarioId !== cmt.id_comentario && (
                                    <div className="comentario-icones">
                                        <img
                                            src="lapis_editar.svg"
                                            alt="Editar"
                                            className="editar-icone"
                                            onClick={() => handleEditClick(cmt.id_comentario, cmt.texto)}
                                        />
                                        <img
                                            src="lixeira_deletar.svg"
                                            alt="Deletar"
                                            className="deletar-icone"
                                            onClick={() => handleDeleteClick(cmt.id_comentario)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal de exclusão */}
            {showDeleteModal && (
                <div className="modal-deletar">
                    <div className="modal-conteudo">
                        <p>Tem certeza que deseja excluir este comentário?</p>
                        <div className="modal-botoes">
                            <button onClick={handleDeleteConfirm} className="botao-deletar">
                                Sim
                            </button>
                            <button onClick={handleDeleteCancel} className="botao-nao">
                                Não
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <textarea
                value={comentario}
                onChange={handleComentarioChange}
                placeholder="Escreva seu comentário"
            />
            <button
                className="comentar"
                disabled={isButtonDisabled}
                onClick={handleComentar}
            >
                Comentar
            </button>
            <button onClick={closeModal}>Fechar</button>
        </div>
    );
}


// Função Main
function Main({ usuarioLogado, openModal }) {

    const [cursos, setCursos] = useState([]);


    useEffect(() => {
        const fetchCursos = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/cursos');
                const cursosComInscricao = await Promise.all(
                    response.data.map(async (curso) => {
                        if (usuarioLogado) {
                            const inscricaoResponse = await axios.get(`http://localhost:3001/api/inscricao/${usuarioLogado.id}/${curso.id_curso}`);
                            return { ...curso, inscrito: inscricaoResponse.data.inscrito };
                        } else {
                            return { ...curso, inscrito: false };
                        }
                    })
                );
                setCursos(cursosComInscricao);
            } catch (error) {
                console.error('Erro ao buscar cursos:', error);
            }
        };
        fetchCursos();
    }, [usuarioLogado]);


    const handleInscricao = () => {
        // Aqui, pode-se atualizar a lista de cursos caso necessário
        // Ou realizar outras ações necessárias após a inscrição
    };

    return (
        <div id="tudo">
            <h2>Cursos</h2>
            {cursos.map((curso) => {
                console.log(curso)
                return (
                    <Postagem
                        key={curso.id_curso}
                        cursoId={curso.id_curso}
                        nomeCurso={curso.nome_curso}
                        fotoMain={curso.foto}
                        instituicao={curso.instituicao}
                        numInscritos={curso.numInscritos}
                        numComentarios={curso.numComentarios}
                        usuarioLogado={usuarioLogado}
                        inscritoInicial={curso.inscrito}
                        openModal={openModal}
                        onInscricao={handleInscricao}
                    />

                )
            })}
        </div>
    );
}
// Função principal App.js

function App() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [usuarioLogado, setUsuarioLogado] = useState(null);
    const [empresa, setEmpresa] = useState(null);

    const openModal = () => setIsModalVisible(true);
    const closeModal = () => setIsModalVisible(false);

    const handleLoginSuccess = (user) => {
        setUsuarioLogado(user);
        fetchFotoUsuario();
    };

    const handleLogout = () => {
        setUsuarioLogado(null);
        window.location.reload();
    };

    useEffect(() => {
        const fetchEmpresa = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/empresa');
                setEmpresa(response.data);
            } catch (error) {
                console.error('Erro ao buscar dados da empresa:', error);
            }
        };
        fetchEmpresa();
    }, []);


    const fetchFotoUsuario = async () => {
        try {
            const response = await axios.get(`http://localhost:3001/api/usuarios/${usuarioLogado.id}`);
            setUsuarioLogado((prev) => ({ ...prev, foto: response.data.foto }));
        } catch (error) {
            console.error('Erro ao buscar foto do usuário:', error);
        }
    };

    return (
        <div className="App">
            <Header />
            <div id="principal">
                <Perfil
                    foto={usuarioLogado && usuarioLogado.foto ? usuarioLogado.foto : empresa ? empresa.logo : "default_logo.png"}
                    nome={usuarioLogado ? usuarioLogado.nome : empresa ? empresa.nome : "FaculHub"}
                    openLoginModal={openModal}
                    onLogout={handleLogout}
                    usuarioLogado={usuarioLogado}
                />
                <Main usuarioLogado={usuarioLogado} openModal={openModal} />
                <LoginModal
                    showModal={isModalVisible}
                    closeModal={closeModal}
                    onLoginSuccess={handleLoginSuccess}
                />
            </div>
        </div>
    );
}

export default App;