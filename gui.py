import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pygame

from jogo_da_velha import criar_board, faz_movimento, get_input_valido, \
                          print_board, verifica_ganhador, verifica_movimento

from minimax import movimentoIA_dificil, movimentoIA_facil, movimentoIA_medio

# Inicializa o sistema de fontes do Pygame
pygame.font.init()

def get_bg_color(dificuldade):
    if dificuldade == "fácil":
        return (133, 255, 133)   
    elif dificuldade == "médio":
        return (250, 255, 107)   
    elif dificuldade == "difícil":
        return (247, 30, 33)     
    return (20, 30, 50)          


def draw_board(win, board):
    height = 600
    width = 600
    tamanho = 600 // 3

    for i in range(1, 3):
        pygame.draw.line(win, (0, 0, 0), (0, i * tamanho), (width, i * tamanho), 3)
        pygame.draw.line(win, (0, 0, 0), (i * tamanho, 0), (i * tamanho, height), 3)

    for i in range(3):
        for j in range(3):
            font = pygame.font.SysFont("comicsans", 100)

            x = j * tamanho
            y = i * tamanho

            if board[i][j] != " ":
                text = font.render(board[i][j], 1, (0, 0, 0))
                text_rect = text.get_rect(center=(x + tamanho // 2, y + tamanho // 2))
                win.blit(text, text_rect)


def redraw_window(win, board, dificuldade):
    win.fill(get_bg_color(dificuldade))
    draw_board(win, board)
    
    # Feedback Visual do nível
    if dificuldade:
        fonte_hud = pygame.font.SysFont("comicsans", 30)
        texto_diff = fonte_hud.render(f"Dificuldade: {dificuldade.capitalize()}", 1, (0, 0, 0))
        win.blit(texto_diff, (10, 10))


def draw_end_game(win, board, ganhador):
    tamanho = 600 // 3
    win_coords = None
    
    # Verifica linha vencedora para desenhar risco de vitoria
    for i in range(3): # Linhas
        if board[i][0] == board[i][1] == board[i][2] != " ":
            win_coords = ((0, i * tamanho + tamanho // 2), (600, i * tamanho + tamanho // 2))
    for j in range(3): # Colunas
        if board[0][j] == board[1][j] == board[2][j] != " ":
            win_coords = ((j * tamanho + tamanho // 2, 0), (j * tamanho + tamanho // 2, 600))
    if board[0][0] == board[1][1] == board[2][2] != " ":
        win_coords = ((0, 0), (600, 600))
    if board[0][2] == board[1][1] == board[2][0] != " ":
        win_coords = ((600, 0), (0, 600))
        
    # traço de reta preta pos vitoria
    if win_coords:
        pygame.draw.line(win, (0, 0, 0), win_coords[0], win_coords[1], 15)

    # Prepara a mensagem final
    fonte_msg = pygame.font.SysFont("comicsans", 60, bold=True)
    if ganhador == "EMPATE":
        msg = "Empate!!"
        cor_texto = (212, 212, 212)
    elif ganhador == "X":
        msg = "Vitória!!"
        cor_texto = (28, 255, 3) 
    else: 
        msg = "Derrota!!"
        cor_texto = (255, 0, 17) 

    texto_render = fonte_msg.render(msg, 1, cor_texto)
    texto_rect = texto_render.get_rect(center=(300, 300))
    
    # Fundo escuro atrás de textos
    bg_rect = texto_rect.inflate(40, 30)
    pygame.draw.rect(win, (0, 0, 0), bg_rect, border_radius=10)
    
    win.blit(texto_render, texto_rect)
    pygame.display.update()


def main():
    win = pygame.display.set_mode((600, 600))
    pygame.display.set_caption("Jogo Da Velha")

    board = criar_board()
    dificuldade = None
    fonte_menu = pygame.font.SysFont("comicsans", 40)

    # Loop do menu para escolher a dificuldade
    while dificuldade is None:
        win.fill(get_bg_color(dificuldade)) 
        texto1 = fonte_menu.render("Escolha a dificuldade:", 1, (255, 255, 255))
        texto2 = fonte_menu.render("[1] Fácil", 1, (133, 255, 133))
        texto3 = fonte_menu.render("[2] Médio", 1, (250, 255, 107))
        texto4 = fonte_menu.render("[3] Difícil", 1, (247, 30, 33))
        
        win.blit(texto1, (100, 150))
        win.blit(texto2, (150, 250))
        win.blit(texto3, (150, 320))
        win.blit(texto4, (150, 390))
        
        pygame.display.update()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_1 or event.key == pygame.K_KP1:
                    dificuldade = "fácil"
                elif event.key == pygame.K_2 or event.key == pygame.K_KP2:
                    dificuldade = "médio"
                elif event.key == pygame.K_3 or event.key == pygame.K_KP3:
                    dificuldade = "difícil"

    # Áudio por Dificuldade
    try:
        pygame.mixer.init()
        if dificuldade == "fácil":
            pygame.mixer.music.load('facil.mp3')
        elif dificuldade == "médio":
            pygame.mixer.music.load('medio.mp3')
        elif dificuldade == "difícil":
            pygame.mixer.music.load('dificil.mp3')
        
        pygame.mixer.music.play(-1)
    except pygame.error as e:
        print(f"Aviso: Não foi possível reproduzir a música da dificuldade ({e}).")

    redraw_window(win, board, dificuldade)
    pygame.display.update()

    jogador = 0
    ganhador = verifica_ganhador(board)
    
    while not ganhador:
        i = None
        j = None
        print_board(board)
        
        if jogador == 0:
            jogou = False
            while not jogou:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        pygame.quit()
                        sys.exit()
                    elif event.type == pygame.MOUSEBUTTONUP:
                        pos = pygame.mouse.get_pos()
                        i = int(pos[1] // 200)
                        j = int(pos[0] // 200)
                        jogou = True
        else:
            # Fluxo condicional de IAs
            if dificuldade == "fácil":
                i, j = movimentoIA_facil(board, jogador)
            elif dificuldade == "médio":
                i, j = movimentoIA_medio(board, jogador)
            else:
                i, j = movimentoIA_dificil(board, jogador)
        
        if i is not None and j is not None and verifica_movimento(board, i, j):
            faz_movimento(board, i, j, jogador)
            jogador = (jogador + 1) % 2
        
        ganhador = verifica_ganhador(board)
        redraw_window(win, board, dificuldade)
        pygame.display.update()

    # Fim de jogo
    draw_end_game(win, board, ganhador)

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

if __name__ == "__main__":
    main()