import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import pygame

from jogo_da_velha import criar_board, faz_movimento, get_input_valido, \
                          print_board, verifica_ganhador, verifica_movimento

from minimax import movimento_ia, movimento_ia_facil, movimento_ia_medio
# Ao iniciar, tenta inicializar o áudio. Se falhar, ignora e segue o jogo.
try:
    pygame.mixer.init()
    pygame.mixer.music.load('musica.mp3')
    pygame.mixer.music.play()
except pygame.error as e:
    print(f"Aviso: Não foi possível inicializar o áudio ({e}). O jogo rodará sem som.")

pygame.font.init()


def draw_board(win, board):
    height = 600
    width = 600
    tamanho = 600 / 3

    for i in range(1, 3):
        pygame.draw.line(win, (0, 0, 0), (0, i * tamanho), (width, i * tamanho), 3)
        pygame.draw.line(win, (0, 0, 0), (i * tamanho, 0), (i * tamanho, height), 3)

    for i in range(3):
        for j in range(3):
            font = pygame.font.SysFont("comicsans", 100)

            x = j * tamanho
            y = i * tamanho

            text = font.render(board[i][j], 1, (0, 0, 0))
            win.blit(text, ((x + 75), (y + 75)))


def redraw_window(win, board, dificuldade):
    win.fill((20, 30, 50))
    draw_board(win, board)
    
    # Feedback Visual do nível
    if dificuldade:
        fonte_hud = pygame.font.SysFont("comicsans", 30)
        texto_diff = fonte_hud.render(f"Dificuldade: {dificuldade.capitalize()}", 1, (255, 255, 255))
        win.blit(texto_diff, (10, 10))


def main():
    win = pygame.display.set_mode((600, 600))
    pygame.display.set_caption("Jogo Da Velha")

    board = criar_board()
    dificuldade = None
    fonte_menu = pygame.font.SysFont("comicsans", 40)

    # Loop do menu para escolher a dificuldade
    while dificuldade is None:
        win.fill((20, 30, 50)) 
        texto1 = fonte_menu.render("Escolha a dificuldade:", 1, (255, 255, 255))
        texto2 = fonte_menu.render("[1] Fácil", 1, (0, 255, 0))
        texto3 = fonte_menu.render("[2] Médio", 1, (255, 255, 0))
        texto4 = fonte_menu.render("[3] Difícil", 1, (255, 0, 0))
        
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
                i, j = movimento_ia_facil(board, jogador)
            elif dificuldade == "médio":
                i, j = movimento_ia_medio(board, jogador)
            else:
                i, j = movimento_ia(board, jogador)
        
        if i is not None and j is not None and verifica_movimento(board, i, j):
            faz_movimento(board, i, j, jogador)
            jogador = (jogador + 1) % 2
        
        ganhador = verifica_ganhador(board)
        redraw_window(win, board, dificuldade)
        pygame.display.update()

    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

if __name__ == "__main__":
    main()